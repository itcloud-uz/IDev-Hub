import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import paymentMethodRoutes from './routes/paymentMethods';
import blogRoutes from './routes/blog';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { telegramBotService } from './services/telegramBot';

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || '5000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ==================== MIDDLEWARE ====================

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ==================== ROUTES ====================

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== ERROR HANDLER ====================

app.use(errorHandler);

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 iDev-Hub Backend is running on http://localhost:${PORT}`);
  console.log(`📦 API available at http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start Telegram Support Bot
  telegramBotService.start();
});

export default app;
