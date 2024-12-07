const Instructor = require("../models/Instructor");
const Course = require("../models/Course");
const Section = require("../models/Section");
const bcrypt = require("bcrypt");
// Instructor login
exports.loginInstructor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find instructor by email
    const instructor = await Instructor.findOne({ email });
    if (!instructor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, instructor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Successful login
    res.status(200).json({
      message: "Instructor login successful",
      user: {
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        phone: instructor.phone,
        department: instructor.department,
        sectionAssigned: instructor.sectionAssigned,
        _id:instructor._id
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in instructor", error });
  }
};

exports.getAssignedCourses = async (req, res) => {
  const { instructorId } = req.params;
  try {
    const courses = await Course.find({ "sections.instructor": instructorId }).populate("sections");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned courses" });
  }
};
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find({});
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch instructors" });
  }
};

// Utility to assign an instructor to a section
const assignInstructorToSection = async (courseId, sectionId, instructorId) => {
  try {
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    // Update the instructor's sectionAssigned field
    instructor.sectionAssigned = sectionId;
    await instructor.save();

    console.log(`Instructor ${instructor.username} assigned to section ${sectionId} of course ${courseId}`);
  } catch (error) {
    console.error("Error assigning instructor to section:", error.message);
    throw error;
  }
};

exports.addInstructor = async (req, res) => {
  const { firstName, lastName, email, password, phone, department, sectionAssigned } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the instructor already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ message: "Instructor with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new instructor
    const instructor = new Instructor({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      department,
      sectionAssigned, // Optional
    });

    await instructor.save();

    res.status(201).json({ message: "Instructor added successfully", instructor });
  } catch (error) {
    console.error("Error adding instructor:", error.message);
    res.status(500).json({ message: "Error adding instructor", error: error.message });
  }
};


exports.updateInstructor = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, phone, department, sectionAssigned } = req.body;

  try {
    // Find the instructor by ID
    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Update fields if provided
    if (firstName) instructor.firstName = firstName;
    if (lastName) instructor.lastName = lastName;
    if (email) instructor.email = email;
    if (phone) instructor.phone = phone;
    if (department) instructor.department = department;
    if (sectionAssigned) instructor.sectionAssigned = sectionAssigned;
    if (password) {
      instructor.password = await bcrypt.hash(password, 10);
    }

    await instructor.save();
    res.status(200).json({ message: "Instructor updated successfully", instructor });
  } catch (error) {
    console.error("Error updating instructor:", error.message);
    res.status(500).json({ message: "Failed to update instructor", error: error.message });
  }
};



exports.deleteInstructor = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the instructor
    const instructor = await Instructor.findByIdAndDelete(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("Error deleting instructor:", error.message);
    res.status(500).json({ message: "Failed to delete instructor", error: error.message });
  }
};

exports.getInstructorAssignedCourses = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // Find all sections assigned to this instructor
    const sections = await Section.find({ instructor: instructorId }).lean();

    if (!sections || sections.length === 0) {
      return res.status(404).json({ message: "No sections found for this instructor." });
    }

    // Extract section IDs to match with courses
    const sectionIds = sections.map((section) => section._id);

    // Find courses that include these sections
    const courses = await Course.find({ sections: { $in: sectionIds } })
      .populate({
        path: "sections",
        match: { _id: { $in: sectionIds } }, // Only include sections assigned to the instructor
        select: "sectionName", // Fetch only the section name
      })
      .lean();

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found for this instructor." });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching assigned courses:", error);
    res.status(500).json({ message: "Failed to fetch assigned courses.", error: error.message });
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
    const user = await Instructor.findOne({ email }); // Replace `Student` with your model
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

