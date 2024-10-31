// controllers/userController.js
const User = require("../models/user");
const Course = require("../models/Course");
// Register a new user
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  // Check if the user already exists
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken." });
    }

    // Create and save a new user
    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error. Could not register user." });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { username, password, role } = req.body;
  // Basic validation
  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials or role." });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    res.status(200).json({ message: "Login successful.", user });
  } catch (err) {
    res.status(500).json({ message: "Server error. Could not log in." });
  }
};
exports.registerCourse = async (req, res) => {
  const { userId } = req.params;
  const { courseId } = req.body; // Expecting courseId in the request body

  try {
    // Check if course exists and populate instructor details
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the user and check their enrolled courses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already enrolled in this course
    if (
      user.enrolledCourses.some((enrolledCourse) =>
        enrolledCourse._id.equals(course._id)
      )
    ) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course." });
    }

    // Enforce the limit of 3 courses
    if (user.enrolledCourses.length >= 3) {
      return res
        .status(400)
        .json({ message: "You can only register for up to 3 courses." });
    }

    // Add the full course object to the user's enrolled courses
    user.enrolledCourses.push(course); // Push the entire course object, not just the ID
    await user.save();

    // Return the updated user object
    res.status(200).json({ message: "Course added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Drop a course for a user
exports.dropCourse = async (req, res) => {
  const { userId } = req.params;
  const { courseId } = req.body; // Expecting courseId in the request body

  try {
    // Find the user and remove the course from their enrolled courses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove corresponding payment related to the dropped course
    user.payment = user.payment.filter(
      (payment) => payment._id.toString() !== courseId.toString()
    );

    // Save updated user data
    await user.save();

    // Return the updated user object
    res
      .status(200)
      .json({ message: "Course and payment removed successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.courcepayments = async (req, res) => {
  const { userId } = req.params;
  const { payments } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize an array to hold error messages for duplicate payments
    const errors = [];

    payments.forEach((paymentEntry) => {
      // Check if the course name already exists in the user's payment array
      const alreadyPaid = user.payment.some(
        (payment) => payment.courceName === paymentEntry.courseName
      );
      if (alreadyPaid) {
        errors.push(
          `Payment for the course "${paymentEntry.courseName}" has already been made.`
        );
      } else {
        // If not already paid, push the new payment entry
        user.payment.push({
          courceName: paymentEntry.courseName,
          payment: paymentEntry.payment,
        });
      }
    });

    // If there are errors, return them
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ message: "Some subjects are already Enrolled", errors });
    }

    await user.save();
    return res.status(200).json({
      message: "Payments added successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
// Get all users with role "student"
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
