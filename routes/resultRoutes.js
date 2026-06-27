import express from 'express';
import {
  addResult,
  getResultsByStudent,
  getAllResults,
  deleteResult
} from '../controllers/resultController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', protect, addResult);
router.get('/all', protect, getAllResults);
router.get('/student/:studentId', getResultsByStudent);
router.delete('/:id', protect, deleteResult);

export default router;
