import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import { initializeDatabase, closeDatabase } from './config/database';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api';
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(apiLimiter);

// Static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ERP Pro API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION
  });
});

// API routes
const apiRouter = express.Router();

// Mount route modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/clients', clientRoutes);

// Mount API router
app.use(`${API_PREFIX}/${API_VERSION}`, apiRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      error: 'File size exceeds the maximum allowed limit'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files',
      error: 'Number of files exceeds the maximum allowed limit'
    });
  }

  // Default error response
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    await closeDatabase();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`
🚀 ERP Pro API Server Started Successfully!

📍 Server Details:
   • Environment: ${process.env.NODE_ENV || 'development'}
   • Port: ${PORT}
   • API Base URL: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}
   • Health Check: http://localhost:${PORT}/health

🔗 Available Endpoints:
   • Authentication: ${API_PREFIX}/${API_VERSION}/auth
   • Clients: ${API_PREFIX}/${API_VERSION}/clients

📚 API Documentation:
   • Swagger UI: http://localhost:${PORT}/api-docs (coming soon)

🛡️  Security Features:
   • CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}
   • Rate limiting active
   • Helmet security headers
   • JWT authentication

💾 Database:
   • SQLite database initialized
   • Sample data loaded

Ready to accept requests! 🎉
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();