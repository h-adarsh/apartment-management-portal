import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import flatsRoutes from './routes/flats.routes';
import financeRoutes from './routes/finance.routes';
import complaintsRoutes from './routes/complaints.routes';
import noticesRoutes from './routes/notices.routes';

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving for uploads (receipts & photos)
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'myGate Apartment Operations API'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/flats', flatsRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/notices', noticesRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 myGate API Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
