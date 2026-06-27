import Student from '../models/Student.js';

// @desc  Create student
// @route POST /api/student/create
export const createStudent = async (req, res) => {
  try {
    const { name, class: studentClass, section, bloodGroup, phone, email } = req.body;

    if (!name || !studentClass || !section || !bloodGroup || !phone || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student with this email already exists' });
    }

    const student = await Student.create({ name, class: studentClass, section, bloodGroup, phone, email });

    res.status(201).json({ success: true, message: 'Student created successfully', data: student });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all students
// @route GET /api/student/all
export const getAllStudents = async (req, res) => {
  try {
    const { search, class: className, section } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (className) query.class = className;
    if (section) query.section = section.toUpperCase();

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get student by ID
// @route GET /api/student/:id
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update student
// @route PUT /api/student/update/:id
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student updated successfully', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete student
// @route DELETE /api/student/delete/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Student login (by class, section, email)
// @route POST /api/student/login
export const studentLogin = async (req, res) => {
  try {
    const { email, class: studentClass, section } = req.body;

    if (!email || !studentClass || !section) {
      return res.status(400).json({ success: false, message: 'Email, class and section are required' });
    }

    const student = await Student.findOne({
      email: email.toLowerCase(),
      class: studentClass,
      section: section.toUpperCase()
    });

    if (!student) {
      return res.status(401).json({ success: false, message: 'No student found with these details' });
    }

    res.json({ success: true, message: 'Login successful', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
