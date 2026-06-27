import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';

// @desc  Add result
// @route POST /api/result/add
export const addResult = async (req, res) => {
  try {
    const { studentId, subjectId, marks } = req.body;

    if (!studentId || !subjectId || marks === undefined) {
      return res.status(400).json({ success: false, message: 'Student, subject and marks are required' });
    }

    if (marks < 0 || marks > 100) {
      return res.status(400).json({ success: false, message: 'Marks must be between 0 and 100' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    // Upsert: update if exists, create if not
    const existing = await Result.findOne({ studentId, subjectId });
    let result;
    if (existing) {
      existing.marks = marks;
      await existing.save();
      result = existing;
    } else {
      result = await Result.create({ studentId, subjectId, marks });
    }

    await result.populate('studentId', 'name class section');
    await result.populate('subjectId', 'subjectName className');

    res.status(201).json({ success: true, message: 'Result saved successfully', data: result });
  } catch (error) {
    // Duplicate key error (e.g. rapid double-click sending two requests
    // before the first one finishes creating the record)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A result for this student and subject already exists. Please refresh and try again.'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get results by student ID
// @route GET /api/result/student/:studentId
export const getResultsByStudent = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId })
      .populate('studentId', 'name class section bloodGroup email')
      .populate('subjectId', 'subjectName className');

    if (!results.length) {
      return res.status(404).json({ success: false, message: 'No results found for this student' });
    }

    // Calculate aggregate stats
    const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
    const maxMarks = results.length * 100;
    const overallPercentage = (totalMarks / maxMarks) * 100;
    const overallGrade = getOverallGrade(overallPercentage);
    const status = overallPercentage >= 50 ? 'Pass' : 'Fail';

    res.json({
      success: true,
      data: {
        student: results[0].studentId,
        results,
        summary: {
          totalMarks,
          maxMarks,
          overallPercentage: overallPercentage.toFixed(2),
          overallGrade,
          status
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all results
// @route GET /api/result/all
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('studentId', 'name class section')
      .populate('subjectId', 'subjectName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete result
// @route DELETE /api/result/:id
export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
    res.json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function getOverallGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'Fail';
}