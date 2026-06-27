import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String
  }
}, { timestamps: true });

// Prevent duplicate result for same student + subject
resultSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

// Auto-calculate percentage and grade before save
resultSchema.pre('save', function() {
  this.percentage = (this.marks / this.totalMarks) * 100;
  this.grade = calculateGrade(this.percentage);
});

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'Fail';
}

export default mongoose.model('Result', resultSchema);