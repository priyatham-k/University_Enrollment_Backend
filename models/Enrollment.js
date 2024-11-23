const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  dateEnrolled: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);
