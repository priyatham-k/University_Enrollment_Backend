const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student");
const mongoose = require("mongoose");

exports.getStudentsBySection = async (req, res) => {
  const { sectionId } = req.params;

  try {
    console.log("Fetching students for Section ID:", sectionId); // Debugging log

    // Convert sectionId to ObjectId using 'new'
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);

    // Fetch enrollments matching the section ID
    const enrollments = await Enrollment.find({ section: sectionObjectId }).populate("student", "username email");

    console.log("Enrollments Found:", enrollments); // Debugging log

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: "No students found for this section." });
    }

    // Extract student details
    const students = enrollments
      .map((enrollment) => {
        if (!enrollment.student) {
          console.error("Enrollment missing student data:", enrollment); // Debugging log
          return null;
        }
        return {
          _id: enrollment.student._id,
          username: enrollment.student.username,
          email: enrollment.student.email,
        };
      })
      .filter(Boolean); // Filter out null entries

    console.log("Students Found:", students); // Debugging log

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students for section:", error);
    res.status(500).json({ message: "Failed to fetch students.", error: error.message });
  }
};
