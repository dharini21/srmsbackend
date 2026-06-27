import express from 'express';
import {
  createSubject,
  getSubjectsByClass,
  getAllSubjects,
  seedSubjects,
  deleteSubject
} from '../controllers/subjectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createSubject);
router.post('/seed', protect, seedSubjects);
router.get('/all', protect, getAllSubjects);
router.get('/class/:className', getSubjectsByClass);
router.delete('/:id', protect, deleteSubject);

export default router;
