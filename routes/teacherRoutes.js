import express from 'express';
import { registerTeacher, loginTeacher, getDashboardStats } from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);
router.get('/dashboard', protect, getDashboardStats);

export default router;
