const Course = require("../models/Course");
const Instructor = require("../models/Instructor");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.addCourse = async (req, res) => {
  const { courseName, courseCode, courseNumber, description, term, sections } =
    req.body;

  try {
    // Validate instructor IDs in sections
    const validatedSections = sections.map((section) => {
      if (
        section.instructor &&
        !mongoose.Types.ObjectId.isValid(section.instructor)
      ) {
        throw new Error(`Invalid instructor ID: ${section.instructor}`);
      }
      return {
        sectionName: section.sectionName,
        instructor: section.instructor
          ? new mongoose.Types.ObjectId(section.instructor)
          : null,
      };
    });

    const course = new Course({
      courseName,
      courseCode,
      courseNumber,
      description,
      term,
      sections: validatedSections,
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { courseName, courseCode, courseNumber, description, term, sections } =
    req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        courseName,
        courseCode,
        courseNumber,
        description,
        term,
        sections: sections.map((section) => ({
          sectionName: section.sectionName,
          instructor: section.instructor
            ? new mongoose.Types.ObjectId(section.instructor)
            : null,
        })),
      },
      { new: true } // Return the updated document
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    // Fetch all courses and populate the instructor within sections
    const courses = await Course.find().populate("sections.instructor"); // Correctly populate nested instructors in sections
    res.status(200).json(courses);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching courses: " + error.message });
  }
};

exports.assignInstructor = async (req, res) => {
  const courseId = req.params.id; // Correctly extract courseId
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

exports.getCoursesByInstructor = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // Find all courses taught by this instructor
    const courses = await Course.find({ "sections.instructor": instructorId });

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this instructor." });
    }

    // For each course and section, find enrolled students
    const coursesWithStudents = await Promise.all(
      courses.map(async (course) => {
        const sectionsWithStudents = await Promise.all(
          course.sections.map(async (section) => {
            const enrolledStudents = await User.find(
              { "payment.courseName": course.courseName, "payment.sectionName": section.sectionName },
              "username"
            );

            return {
              sectionName: section.sectionName,
              enrolledStudents: enrolledStudents.map((student) => student.username),
            };
          })
        );

        return {
          courseName: course.courseName,
          courseCode: course.courseCode,
          term: course.term,
          description: course.description,
          sections: sectionsWithStudents,
        };
      })
    );

    res.status(200).json(coursesWithStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
