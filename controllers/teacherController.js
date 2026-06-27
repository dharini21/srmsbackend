import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Result from '../models/Result.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc  Register teacher
// @route POST /api/teacher/register
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Teacher already exists with this email' });
    }

    const teacher = await Teacher.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        token: generateToken(teacher._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Login teacher
// @route POST /api/teacher/login
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        token: generateToken(teacher._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get dashboard stats
// @route GET /api/teacher/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalClasses = await Student.distinct('class').then(c => c.length);
    const totalSubjects = await Subject.countDocuments();
    const recentResults = await Result.find()
      .populate('studentId', 'name class section')
      .populate('subjectId', 'subjectName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: { totalStudents, totalClasses, totalSubjects, recentResults }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
