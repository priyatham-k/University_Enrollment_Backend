const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "firstName")
      .populate("course", "courseName")
      .populate("section", "sectionName");
    
    const formattedEnrollments = enrollments.map((enrollment) => ({
      _id: enrollment._id,
      studentName: enrollment.student.firstName,
      courseName: enrollment.course.courseName,
      sectionName: enrollment.section.sectionName,
    }));

    res.status(200).json(formattedEnrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ message: "Failed to fetch enrollments", error: error.message });
  }
};
