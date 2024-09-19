const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  degreeProgram: { type: String, required: true },
  major: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  season: { type: String, required: true },
  englishTest: { type: String, required: true },
});

// Create the model from the schema and export it
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
