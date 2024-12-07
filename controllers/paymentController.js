const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student"); // Ensure correct import
const Section = require("../models/Section");
// Fetch all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("student", "firstName") // Ensure the field matches the schema reference
      .populate("course", "courseName")
      .populate("section", "sectionName");
    const formattedPayments = payments.map((payment) => ({
      _id: payment._id,
      studentName: payment.student.firstName,
      courseName: payment.course.courseName,
      sectionName: payment.section.sectionName,
      amount: payment.amount,
    }));

    res.status(200).json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments", error: error.message });
  }
};

// Process payments and enrollments
exports.processPaymentAndEnrollments = async (req, res) => {
  const { userId, totalAmount, paymentDetails, courses } = req.body;

  try {

    if (!userId || !totalAmount || !courses || courses.length === 0) {
      return res.status(400).json({ message: "Invalid request. Missing required fields." });
    }

    for (const course of courses) {
      if (!course.sectionId) {
        return res.status(400).json({ message: `Missing sectionId for courseId: ${course.courseId}` });
      }
    }

    // Fetch existing enrollments for the user
    const existingEnrollments = await Enrollment.find({ student: userId });

    // Ensure no duplicate enrollments
    const existingCourseIds = existingEnrollments.map((enrollment) => enrollment.course.toString());
    const newCourseIds = courses.map((course) => course.courseId);

    for (const courseId of newCourseIds) {
      if (existingCourseIds.includes(courseId)) {
        return res.status(400).json({ message: `Duplicate enrollment is not allowed.` });
      }
    }

    // Ensure total courses do not exceed 3
    const totalEnrollments = existingEnrollments.length + courses.length;
    if (totalEnrollments > 3) {
      return res.status(400).json({
        message: `Enrollment limit exceeded. You can only enroll in a maximum of 3 courses.`,
      });
    }

    const paymentRecords = [];
    const enrollmentRecords = [];

    for (const course of courses) {
      // Create payment record
      const payment = new Payment({
        student: userId,
        course: course.courseId,
        section: course.sectionId, // Populate the `section` field
        amount: course.amount,
        paymentDate: new Date(),
      });

      await payment.save();
      paymentRecords.push(payment);

      // Create enrollment record
      const enrollment = new Enrollment({
        student: userId,
        course: course.courseId,
        section: course.sectionId,
        dateEnrolled: new Date(),
      });

      await enrollment.save();
      enrollmentRecords.push(enrollment);
    }

    res.status(200).json({
      message: "Payment processed and enrollments created successfully.",
      payments: paymentRecords,
      enrollments: enrollmentRecords,
    });
  } catch (error) {
    console.error("Error processing payments and enrollments:", error);
    res.status(500).json({
      message: "Failed to process payments and enrollments.",
      error: error.message,
    });
  }
};




