import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from './config/database.js';
import errorHandler from './middleware/errorHandler.js';


// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// Manual CORS headers
// CORS - use the cors package so origins can be configured via env
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : null;
app.use(
  cors({
    origin: allowedOrigins || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  })
);

// Handle preflight requests (use cors middleware for OPTIONS)
app.options('*', cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/insights', insightsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((res, rej) => {
        mongoose.connection.once('open', res);
        mongoose.connection.once('error', rej);
      });
    }
    console.log('MongoDB connection established');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
