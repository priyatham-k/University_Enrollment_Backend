const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, // First name of the instructor
  lastName: { type: String, required: true },  // Last name of the instructor
  email: { type: String, required: true, unique: true }, // Email for login
  password: { type: String, required: true }, // Password for login
  phone: { type: String, required: true }, // Contact phone
  department: { type: String, required: true }, // Department of the instructor
  sectionAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // Section reference
});

module.exports = mongoose.model("Instructor", instructorSchema);
