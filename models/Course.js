const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  courseNumber: { type: String, required: true },
  description: { type: String, required: true },
  term: { type: String, required: true },
  sections: [
    {
      sectionName: { type: String, required: true },
      instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: false }
    }
  ]
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
