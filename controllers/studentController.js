const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const bcrypt = require("bcrypt");
// Student login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Student login successful",
      user: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        department: student.department,
        _id:student._id
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in student", error });
  }
};
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, department } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a student with the same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Student with this email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student
    const newStudent = new Student({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      department,
    });

    // Save the student to the database
    await newStudent.save();

    res.status(201).json({
      message: "Student registered successfully",
      student: {
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
        department: newStudent.department,
        phone:newStudent.phone,
        _id:newStudent._id
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering student", error });
  }
};
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params; // Student ID
    const updates = req.body; // Fields to update

    // Hash the password if it is being updated
    if (updates.password) {
      const bcrypt = require("bcrypt");
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update the student with the provided fields
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updates,
      {
        new: true, // Return the updated document
        runValidators: true, // Validate only the fields being updated
        context: "query", // Context for validators
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params; // Student ID passed in the URL

    // Find and delete the student by ID
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, "firstName lastName department email phone");
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
      .populate("course", "courseName") 
      .populate({
        path: "section", 
        select: "sectionName instructor", 
        populate: {
          path: "instructor",
          select: "firstName lastName",
        },
      });

    // Map the data to return formatted results
    const enrolledClasses = payments.map((payment) => {
      if (!payment.section) {
        throw new Error(
          `Section with ID ${payment.section} not found for Payment ID ${payment._id}`
        );
      }

      const instructor = payment.section.instructor
        ? `${payment.section.instructor.firstName} ${payment.section.instructor.lastName}`
        : "Instructor not assigned";
      return {
        _id: payment._id,
        courseName: payment.course.courseName,
        sectionName: payment.section.sectionName,
        instructorName: instructor,
        amount: payment.amount,
        cid:payment.course._id
      };
    });

    res.status(200).json(enrolledClasses);
  } catch (error) {
    console.error("Error fetching enrolled classes:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch enrolled classes", error: error.message });
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

exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user by email
    const user = await Student.findOne({ email }); // Replace `Student` with your model
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to update password", error: error.message });
  }
};



exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user by email
    const user = await Student.findOne({ email }); // Replace `Student` with your model
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to update password", error: error.message });
  }
};