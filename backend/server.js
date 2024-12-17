import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import dotenv from "dotenv/config.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// App configuration
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Database connection
connectDB();

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

