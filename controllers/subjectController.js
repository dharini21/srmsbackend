import Subject from '../models/Subject.js';

// Default subjects per class
const DEFAULT_SUBJECTS = {
  '1': ['English', 'Tamil', 'Mathematics', 'Science'],
  '2': ['English', 'Tamil', 'Mathematics', 'Science'],
  '3': ['English', 'Tamil', 'Mathematics', 'Science', 'Social Science'],
  '4': ['English', 'Tamil', 'Mathematics', 'Science', 'Social Science'],
  '5': ['English', 'Tamil', 'Mathematics', 'Science', 'Social Science']
};

// @desc  Create subject
// @route POST /api/subject/create
export const createSubject = async (req, res) => {
  try {
    const { subjectName, className } = req.body;

    if (!subjectName || !className) {
      return res.status(400).json({ success: false, message: 'Subject name and class are required' });
    }

    const existing = await Subject.findOne({ subjectName, className });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Subject already exists for this class' });
    }

    const subject = await Subject.create({
      subjectName,
      className,
      createdBy: req.teacher._id
    });

    res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get subjects by class
// @route GET /api/subject/class/:className
export const getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ className: req.params.className });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all subjects
// @route GET /api/subject/all
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ className: 1, subjectName: 1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Seed default subjects
// @route POST /api/subject/seed
export const seedSubjects = async (req, res) => {
  try {
    let created = 0;
    for (const [className, subjects] of Object.entries(DEFAULT_SUBJECTS)) {
      for (const subjectName of subjects) {
        const exists = await Subject.findOne({ subjectName, className });
        if (!exists) {
          await Subject.create({ subjectName, className, createdBy: req.teacher._id });
          created++;
        }
      }
    }
    res.json({ success: true, message: `${created} subjects seeded successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete subject
// @route DELETE /api/subject/:id
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
