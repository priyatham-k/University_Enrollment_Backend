const mongoose = require("mongoose");

const graduateApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: { type: String, required: true },
  degreeProgram: { type: String, required: true },
  major: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  season: { type: String, required: true }, // e.g., Spring 2025
  englishTest: { type: String, required: true }, // e.g., TOEFL, IELTS, Duolingo
  applicationStatus: { type: String, default: "pending" },
  submissionDate: { type: Date, default: Date.now },
});

const GraduateApplication = mongoose.model(
  "GraduateApplication",
  graduateApplicationSchema
);

module.exports = GraduateApplication;
