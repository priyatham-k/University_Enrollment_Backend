const Instructor = require("../models/Instructor");
const Course = require("../models/Course");
const Section = require("../models/Section");
// Instructor login
exports.loginInstructor = async (req, res) => {
  try {
    const { username, password } = req.body;
    const instructor = await Instructor.findOne({ username, password });

    if (!instructor) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.status(200).json({ message: "Instructor login successful", user: instructor });
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
  const { username, email, password, department } = req.body;
  
  try {
    // Validate required fields
    if (!username || !email || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the instructor already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ message: "Instructor with this email already exists" });
    }

    // Create a new instructor
    const instructor = new Instructor({
      username,
      email,
      password,
      department,
    });

    await instructor.save();

    res.status(200).json({ message: "Instructor added successfully", instructor });
  } catch (error) {
    console.error("Error adding instructor:", error.message);
    res.status(500).json({ message: "Error adding instructor", error: error.message });
  }
};


exports.updateInstructor = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, department } = req.body;

  try {
    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    instructor.username = name || instructor.username;
    instructor.email = email || instructor.email;
    if (password) {
      instructor.password = password;
    }
    instructor.department = department || instructor.department;

    await instructor.save();
    res.status(200).json({ message: "Instructor updated successfully", instructor });
  } catch (error) {
    console.error("Error updating instructor:", error.message);
    res.status(500).json({ message: "Failed to update instructor" });
  }
};


exports.deleteInstructor = async (req, res) => {
  const { id } = req.params;

  try {
    const instructor = await Instructor.findByIdAndDelete(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("Error deleting instructor:", error.message);
    res.status(500).json({ message: "Failed to delete instructor" });
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



