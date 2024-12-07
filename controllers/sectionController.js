const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student");
const mongoose = require("mongoose");

exports.getStudentsBySection = async (req, res) => {
  const { sectionId } = req.params;

  try {
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);

    const enrollments = await Enrollment.find({ section: sectionObjectId }).populate("student", "firstName lastName");


    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: "No students found for this section." });
    }
    const students = enrollments
      .map((enrollment) => {
        if (!enrollment.student) {
          return null;
        }
        return {
          _id: enrollment.student._id,
          firstName: enrollment.student.firstName,
          lastName:enrollment.student.lastName,
          email: enrollment.student.email,
        };
      })
      .filter(Boolean); 
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students for section:", error);
    res.status(500).json({ message: "Failed to fetch students.", error: error.message });
  }
};
