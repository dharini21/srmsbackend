import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  studentLogin
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', studentLogin);
router.post('/create', protect, createStudent);
router.get('/all', protect, getAllStudents);
router.get('/:id', protect, getStudentById);
router.put('/update/:id', protect, updateStudent);
router.delete('/delete/:id', protect, deleteStudent);

export default router;
