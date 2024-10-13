const Course = require("../models/Course");
const Instructor = require('../models/Instructor');
exports.addCourse = async (req, res) => {
  const { courseName, courseCode, courseNumber, description,term } = req.body;

  try {
    const course = new Course({
      courseName,
      courseCode,
      courseNumber,
      description,term,
      instructor: null, // Initially no instructor
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor"); // Populate instructor details
    res.status(200).json(courses);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching courses: " + error.message });
  }
};

exports.assignInstructor = async (req, res) => {
  const  courseId  = req.params.id; // Correctly extract courseId
  const { instructorId } = req.body;


  try {
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { instructor: instructorId },
      { new: true }
    ).populate("instructor");

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/courses.js
exports.removeInstructor = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Find and update the course, setting instructor to null
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { instructor: null }, // Remove instructor
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({
      message: "Instructor removed successfully",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// controllers/courses.js
exports.deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Find and delete the course by ID
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
