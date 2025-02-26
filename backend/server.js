import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js"; // Import the connectDB function
import { errorHandler } from "./middleware/errorHandler.js"; // Import the errorHandler
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

// Import routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://sristi-kheduthaat.vercel.app/",
      "https://sristi-kheduthaat-keshavchahal2002kc-gmailcoms-projects.vercel.app/",
      "https://sristi-kheduth-git-419fa9-keshavchahal2002kc-gmailcoms-projects.vercel.app/",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "Set-Cookie",
    "X-Requested-With",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS with custom options
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve files from the uploads directory

// Database connection
connectDB(); // Now properly imported and should work

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Working");
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.statusCode = 404;
  next(error);
});

// Global error handler (should be the last middleware)
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
