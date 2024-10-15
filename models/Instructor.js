const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // Use `sparse` index
  password: { type: String, required: true },
  role:{ type: String, required: true },
  department: { type: String, required: true }
});

const Instructor = mongoose.model('Instructor', InstructorSchema);
module.exports = Instructor;