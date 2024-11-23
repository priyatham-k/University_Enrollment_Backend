const mongoose = require("mongoose");

// Course Schema
const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true }, // Name of the course
  courseCode: { type: String, required: true }, // Unique course code
  courseNumber: { type: Number, required: true }, // Numeric identifier for the course
  description: { type: String }, // Optional course description
  term: { type: String, required: true }, // Term or semester
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // Array of Section references
});

module.exports = mongoose.model("Course", courseSchema);
