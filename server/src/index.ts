import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import activityRouter from './routes/activity';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually localhost:5173)
app.use(cors({
  origin: '*', // Allow all origins for simple local development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Bind API Routers
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/activity', activityRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ForgePilot AI 🚀 Backend Server Active`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
