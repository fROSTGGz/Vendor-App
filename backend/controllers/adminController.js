import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Parser } from "json2csv";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
export {
  downloadVendorReportPDF as downloadVendorsPDF,
  downloadVendorReportCSV as downloadVendorsCSV,
};
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image,
      vendor: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    next(error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
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
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("vendor", "name")
      .populate({
        path: "orderItems.product",
        select: "name stock",
      });

    const detailedOrders = orders.map((order) => {
      const productDetails = order.orderItems.map((item) => ({
        productName: item.product?.name || "Unknown",
        initialStock:
          item.product?.stock !== undefined
            ? item.product.stock + item.quantity
            : "N/A",
        quantityCheckedOut: item.quantity,
        remainingStock:
          item.product?.stock !== undefined ? item.product.stock : "N/A",
      }));

      return { ...order.toObject(), productDetails };
    });

    res.status(200).json(detailedOrders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const downloadVendorReportPDF = async (req, res) => {
  try {
    console.log("PDF Generation Started");

    // Fetch vendor data (keep your existing aggregation logic)
    const vendors = await User.aggregate([
      { $match: { role: "vendor" } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "vendor",
          as: "products",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "vendor",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: "$products" },
          totalOrders: { $size: "$orders" },
          totalRevenue: {
            $sum: "$orders.totalPrice",
          },
        },
      },
    ]);

    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Attempt to load a Unicode-friendly font
    let customFont;
    try {
      // Fallback font loading with error handling
      const fontPaths = [
        path.join(__dirname, "fonts", "NotoSans-Regular.ttf"),
        path.join(process.cwd(), "fonts", "NotoSans-Regular.ttf"),
        path.join(process.cwd(), "backend", "fonts", "NotoSans-Regular.ttf"),
      ];

      let fontBytes;
      for (const fontPath of fontPaths) {
        try {
          if (fs.existsSync(fontPath)) {
            fontBytes = await fs.promises.readFile(fontPath);
            break;
          }
        } catch (err) {
          console.log(`Could not read font from ${fontPath}`);
        }
      }

      // If no font found, use standard font with character replacement
      if (!fontBytes) {
        console.warn("No custom font found, falling back to standard font");
        customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      } else {
        customFont = await pdfDoc.embedFont(fontBytes);
      }
    } catch (fontError) {
      console.error("Font Loading Error:", fontError);
      customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    // Safe text encoding function
    const safeEncodeText = (text) => {
      // Replace Rupee symbol and handle potential undefined
      return (text || "")
        .toString()
        .replace(/₹/g, "Rs.")
        .replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII characters
    };

    // Page creation function
    const addNewPage = () => {
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      return { page, width, height };
    };

    // First page with title
    let { page, width, height } = addNewPage();
    let yPosition = height - 50;

    // Title
    page.drawText("Comprehensive Vendor Report", {
      x: 50,
      y: yPosition,
      size: 20,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 50;

    // Process each vendor
    vendors.forEach((vendor, vendorIndex) => {
      // Check if we need a new page
      if (yPosition < 100) {
        ({ page, width, height } = addNewPage());
        yPosition = height - 50;
      }

      // Vendor Header
      page.drawText(
        `Vendor ${vendorIndex + 1}: ${safeEncodeText(vendor.name)}`,
        {
          x: 50,
          y: yPosition,
          size: 16,
          font: customFont,
          color: rgb(0, 0, 0),
        }
      );
      yPosition -= 30;

      // Vendor Details
      page.drawText(`Email: ${safeEncodeText(vendor.email)}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Total Products: ${vendor.totalProducts}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Total Orders: ${vendor.totalOrders}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      // Total Revenue with safe encoding
      page.drawText(
        `Total Revenue: ${safeEncodeText(
          `Rs. ${vendor.totalRevenue.toFixed(2)}`
        )}`,
        {
          x: 50,
          y: yPosition,
          size: 12,
          font: customFont,
          color: rgb(0, 0, 0),
        }
      );
      yPosition -= 40;

      // Product Details
      page.drawText("Product Details:", {
        x: 50,
        y: yPosition,
        size: 14,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      // Iterate through products
      vendor.products.forEach((product, productIndex) => {
        // Check if we need a new page
        if (yPosition < 100) {
          ({ page, width, height } = addNewPage());
          yPosition = height - 50;
        }

        // Product Details
        page.drawText(
          `Product ${productIndex + 1}: ${safeEncodeText(product.name)}`,
          {
            x: 70,
            y: yPosition,
            size: 12,
            font: customFont,
            color: rgb(0, 0, 0),
          }
        );
        yPosition -= 20;

        page.drawText(`Category: ${safeEncodeText(product.category)}`, {
          x: 90,
          y: yPosition,
          size: 10,
          font: customFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(
          `Price: ${safeEncodeText(`Rs. ${product.price.toFixed(2)}`)}`,
          {
            x: 90,
            y: yPosition,
            size: 10,
            font: customFont,
            color: rgb(0, 0, 0),
          }
        );
        yPosition -= 20;

        page.drawText(`Current Stock: ${product.stock}`, {
          x: 90,
          y: yPosition,
          size: 10,
          font: customFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 40;
      });

      // Add some space between vendors
      yPosition -= 40;
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Send PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=vendor_report.pdf"
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Comprehensive PDF Generation Error:", error);
    res.status(500).json({
      message: "Error generating comprehensive PDF report",
      error: error.message,
    });
  }
};

export const downloadVendorReportCSV = async (req, res) => {
  try {
    // Fetch comprehensive vendor data
    const vendors = await User.aggregate([
      { $match: { role: "vendor" } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "vendor",
          as: "products",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "vendor",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: "$products" },
          totalOrders: { $size: "$orders" },
          totalRevenue: {
            $sum: "$orders.totalPrice",
          },
        },
      },
    ]);

    // Transform data for CSV
    const transformedData = vendors.flatMap((vendor) =>
      vendor.products.map((product) => ({
        VendorName: vendor.name,
        VendorEmail: vendor.email,
        TotalVendorProducts: vendor.totalProducts,
        TotalVendorOrders: vendor.totalOrders,
        TotalVendorRevenue: vendor.totalRevenue.toFixed(2),

        ProductName: product.name,
        ProductCategory: product.category,
        ProductPrice: product.price.toFixed(2),
        ProductStock: product.stock,
        ProductCreatedAt: product.createdAt.toISOString().split("T")[0],
      }))
    );

    // Generate CSV
    const fields = [
      "VendorName",
      "VendorEmail",
      "TotalVendorProducts",
      "TotalVendorOrders",
      "TotalVendorRevenue",
      "ProductName",
      "ProductCategory",
      "ProductPrice",
      "ProductStock",
      "ProductCreatedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(transformedData);

    // Send CSV
    res.header("Content-Type", "text/csv");
    res.attachment("comprehensive_vendors_report.csv");
    res.send(csvData);
  } catch (error) {
    res.status(500).json({
      message: "Error generating comprehensive CSV report",
      error: error.message,
    });
  }
};

export const getVendorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const products = await Product.find({ vendor: id });
    const orders = await Order.find({ vendor: id }).populate(
      "orderItems.product"
    );

    const salesData = products.map((product) => {
      const soldQuantity = orders.reduce((total, order) => {
        const item = order.orderItems.find(
          (item) => item.product.toString() === product._id.toString()
        );
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
    res
      .status(500)
      .json({ message: "Error fetching vendor details", error: error.message });
  }
};
