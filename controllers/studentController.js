const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
// Student login
exports.loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;
    const student = await Student.findOne({ username, password });

    if (!student) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res
      .status(200)
      .json({ message: "Student login successful", user: student });
  } catch (error) {
    res.status(500).json({ message: "Error logging in student", error });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, "username fullname email phone");
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
exports.getEnrolledClasses = async (req, res) => {
  const { studentId } = req.params;

  try {
    const payments = await Payment.find({ student: studentId })
      .populate("course", "courseName") // Ensure "courseName" exists in Course schema
      .populate({
        path: "section", // Ensure "section" references the correct model
        select: "sectionName", // Fetch only "sectionName"
      });

    // Map the data to return formatted results
    const enrolledClasses = payments.map((payment) => {
      if (!payment.section) {
        throw new Error(
          `Section with ID ${payment.section} not found for Payment ID ${payment._id}`
        );
      }

      return {
        _id: payment._id,
        courseName: payment.course.courseName,
        sectionName: payment.section.sectionName,
        amount: payment.amount,
      };
    });

    res.status(200).json(enrolledClasses);
  } catch (error) {
    console.error("Error fetching enrolled classes:", error);
    res.status(500).json({ message: "Failed to fetch enrolled classes", error: error.message });
  }
};


exports.dropCourse = async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;

  try {
    // Remove the payment record for the dropped course
    const payment = await Payment.findOneAndDelete({
      _id: courseId,
      student: studentId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Remove the associated enrollment record
    await Enrollment.findOneAndDelete({
      course: payment.course,
      student: studentId,
    });

    res.status(200).json({ message: "Course dropped successfully" });
  } catch (error) {
    console.error("Error dropping course:", error);
    res
      .status(500)
      .json({ message: "Failed to drop the course", error: error.message });
  }
};
