const express = require("express");
const router = express.Router();
const Application = require("../models/studentApplication"); // Import the model

// POST route to handle form submission
router.post("/submit", async (req, res) => {
  const { studentName, degreeProgram, major, contactEmail, contactPhone, season, englishTest } = req.body;

  // Validation
  if (!studentName || !degreeProgram || !major || !contactEmail || !contactPhone || !season || !englishTest) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Create a new application instance
  const newApplication = new Application({
    studentName,
    degreeProgram,
    major,
    contactEmail,
    contactPhone,
    season,
    englishTest,
  });

  // Save to the database
  try {
    await newApplication.save();
    res.status(200).json({ message: "Application submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting the application." });
  }
});

module.exports = router;
