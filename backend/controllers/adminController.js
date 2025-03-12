import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Parser } from 'json2csv';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Update image handling
    const image = req.file 
      ? `/uploads/${req.file.filename}` 
      : null;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image, // Store full path
      vendor: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('vendor', 'name')
      .populate({
        path: 'orderItems.product',
        select: 'name stock'
      });

    const detailedOrders = orders.map(order => {
      const productDetails = order.orderItems.map(item => ({
        productName: item.product?.name || 'Unknown',
        initialStock: item.product?.stock !== undefined 
          ? item.product.stock + item.quantity 
          : 'N/A',
        quantityCheckedOut: item.quantity,
        remainingStock: item.product?.stock !== undefined 
          ? item.product.stock 
          : 'N/A'
      }));

      return {
        ...order.toObject(),
        productDetails,
        user: order.user,
        vendor: order.vendor,
        totalPrice: order.totalPrice
      };
    });

    res.status(200).json(detailedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

export const downloadVendorsPDF = async (req, res) => {
  try {
    const vendors = await User.aggregate([
      { $match: { role: 'vendor' } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendor',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $极客时间size: '$products' }
        }
      }
    ]);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Vendor Information Report', {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0)
    });

    let yPosition = height - 100;
    vendors.forEach((vendor, index) => {
      const vendorText = `
        Vendor ${index + 1}:
        Name: ${vendor.name}
        Email: ${vendor.email}
        Total Products: ${vendor.productCount}
      `;

      page.drawText(vendorText, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      });

      yPosition -= 100;
    });

    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

export const downloadVendorsCSV = async (req, res) => {
  try {
    const vendors = await User.aggregate([
      { $match: { role: 'vendor' } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendor',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      }
    ]);

    const transformedVendors = vendors.map(vendor => ({
      name: vendor.name,
      email: vendor.email,
      totalProducts: vendor.productCount,
      registeredAt: vendor.createdAt
    }));

    const fields = ['name', 'email', 'totalProducts', 'registeredAt'];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(transformedVendors);

    res.header('Content-Type', 'text/csv');
    res.attachment('vendors.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ message: 'Error generating CSV', error: error.message });
  }
};

export const getVendorDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const products = await Product.find({ vendor: id });
    const orders = await Order.find({ vendor: id }).populate('orderItems.product');

    const salesData = products.map(product => {
      const soldQuantity = orders.reduce((total, order) => {
        const item = order.orderItems.find(item => item.product.toString() === product._id.toString());
        return total + (item ? item.quantity : 0);
      }, 0);

      return {
        product,
        soldQuantity,
        remainingStock: product.stock - soldQuantity,
      };
    });

    res.json({ vendor, products, salesData });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ message: 'Error fetching vendor details', error: error.message });
  }
};
