import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json() as any);

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'online', system: 'DevOps Quest API v1.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});