import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/database";
//import { apiLimiter } from './middleware/rateLimiter';
import {
  sendErrorResponse,
  AppError,
  handleLargeRequestError,
} from "./utils/errorHandler";
import { initializeSocket } from "./utils/socket";

// Routes
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import messageRoutes from "./routes/messages";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Middleware
// Increase JSON body size limit to 10MB for handling base64 encoded images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(handleLargeRequestError); // Handle "request entity too large" errors
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Request logger

// API rate limiting
//app.use('/api', apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// 404 handler - route not found
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response) => {
  sendErrorResponse(res, err);
});

// Initialize Socket.IO
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log("Socket.IO server initialized");
});
