import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import pool from './config/db';

dotenv.config();

const app = express();

// Test DB connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('DB connection error:', err));


app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || true, // Allow configured origin or all if not set
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import customerRoutes from './routes/customerRoutes';
import readingRoutes from './routes/readingRoutes';
import billRoutes from './routes/billRoutes';
import reportRoutes from './routes/reportRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint for Railway
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'wsms-server'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      service: 'wsms-server',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve static files from the client build directory
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

export default app;
