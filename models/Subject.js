import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  className: {
    type: String,
    required: [true, 'Class name is required'],
    enum: ['1', '2', '3', '4', '5']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }
}, { timestamps: true });

// Prevent duplicate subjects per class
subjectSchema.index({ subjectName: 1, className: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);
