const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sectionAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  email: { type: String, required: true, unique: true }, // Added email
  department: { type: String, required: true }
});

module.exports = mongoose.model("Instructor", instructorSchema);
