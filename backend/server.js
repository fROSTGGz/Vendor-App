import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "dotenv/config.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// DB Connection
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

// Global error handler (should be the last middleware)
app.use(errorHandler);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next({
    message: `Can't find ${req.originalUrl} on this server!`,
    statusCode: 404,
  });
});

// this is to run the express server
app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});

