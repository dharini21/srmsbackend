import express, { json } from 'express';
import mongoose, { connect } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import resultRoutes from './routes/resultRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://srmsfront.vercel.app'],
  credentials: true
}));
app.use(json());

// MongoDB connection (cached across serverless invocations)
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  await connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB connected successfully');
}

// Ensure DB is connected before handling any request.
// On Vercel the file is imported fresh per cold start, so we connect lazily
// here instead of gating app.listen on it.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/result', resultRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Student Result Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Only listen on a port when running locally (e.g. `node server.js` / nodemon).
// On Vercel, the platform imports `app` and invokes it as a request handler instead.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

export default app;