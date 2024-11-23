const mongoose = require("mongoose");

// Section Schema
const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true }, // Section name (e.g., "A")
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Reference to the Course
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", default: null }, // Reference to Instructor
});

module.exports = mongoose.model("Section", sectionSchema);
