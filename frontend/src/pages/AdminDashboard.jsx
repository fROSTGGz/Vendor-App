import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, ordersRes] = await Promise.allSettled([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/orders')
        ]);

        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);

        // Handle rejections
        if (usersRes.status === 'rejected') console.error('Users Error:', usersRes.reason);
        if (ordersRes.status === 'rejected') console.error('Orders Error:', ordersRes.reason);

      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user || user.role !== 'admin') {
    return <div>Unauthorized access</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <ul>
            {users.map(user => (
              <li key={user._id} className="mb-2">
                {user.name} - {user.email} ({user.role})
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <ul>
            {orders.map(order => (
              <li key={order._id} className="mb-2">
                Order #{order._id} - ${order.totalPrice}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

export const downloadVendorsPDF = async (req, res) => {
  try {
    console.log("PDF Generation Started");

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

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    let customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const addNewPage = () => {
      const page = pdfDoc.addPage();
      return { page, width: page.getWidth(), height: page.getHeight() };
    };

    let { page, width, height } = addNewPage();
    let yPosition = height - 50;
    page.drawText("Comprehensive Vendor Report", { x: 50, y: yPosition, size: 20, font: customFont, color: rgb(0, 0, 0) });
    yPosition -= 50;

    vendors.forEach((vendor, vendorIndex) => {
      if (yPosition < 100) ({ page, width, height } = addNewPage(), yPosition = height - 50);
      page.drawText(`Vendor ${vendorIndex + 1}: ${vendor.name}`, { x: 50, y: yPosition, size: 16, font: customFont, color: rgb(0, 0, 0) });
      yPosition -= 30;
      page.drawText(`Total Products: ${vendor.totalProducts}`, { x: 50, y: yPosition, size: 12, font: customFont, color: rgb(0, 0, 0) });
      yPosition -= 20;
      vendor.products.forEach((product, productIndex) => {
        if (yPosition < 100) ({ page, width, height } = addNewPage(), yPosition = height - 50);
        page.drawText(`Product ${productIndex + 1}: ${product.name}`, { x: 70, y: yPosition, size: 12, font: customFont, color: rgb(0, 0, 0) });
        yPosition -= 20;
        page.drawText(`Marketplace: ${product.marketplace || 'N/A'}`, { x: 90, y: yPosition, size: 10, font: customFont, color: rgb(0, 0, 0) });
        yPosition -= 20;
      });
      yPosition -= 40;
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=vendor_report.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Error generating PDF report", error: error.message });
  }
};

export const downloadVendorsCSV = async (req, res) => {
  try {
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
    ]);

    const transformedData = vendors.flatMap((vendor) =>
      vendor.products.map((product) => ({
        VendorName: vendor.name,
        VendorEmail: vendor.email,
        TotalVendorProducts: vendor.totalProducts,
        ProductName: product.name,
        Marketplace: product.marketplace || 'N/A',
        ProductCategory: product.category,
        ProductPrice: product.price.toFixed(2),
        ProductStock: product.stock,
      }))
    );

    const fields = [
      "VendorName",
      "VendorEmail",
      "TotalVendorProducts",
      "ProductName",
      "Marketplace",
      "ProductCategory",
      "ProductPrice",
      "ProductStock",
    ];

    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(transformedData);

    res.header("Content-Type", "text/csv");
    res.attachment("vendor_report.csv");
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: "Error generating CSV report", error: error.message });
  }
};

export const getVendorDetails = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id)
      .populate('products')
      .populate('orders');
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor details' });
  }
};
