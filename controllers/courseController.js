
const Course = require("../models/Course");
const Instructor = require("../models/Instructor");
const Section = require("../models/Section");
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate({
        path: "sections", 
        populate: {
          path: "instructor",
          select: "firstName lastName email",
        },
        select: "sectionName numberOfSeats", // Include sectionName and numberOfSeats in the response
      });

    res.json(courses); // Return populated courses
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

exports.addCourse = async (req, res) => {
  const { courseName, courseCode, description, term, sections } = req.body;

  try {
    // Validate courseName and courseCode
    const existingCourse = await Course.findOne({
      $or: [
        { courseName: courseName.trim() },
        { courseCode: courseCode.trim() },
      ],
    });

    if (existingCourse) {
      return res.status(400).json({
        message: "Course with the same name or code already exists.",
      });
    }

    // Validate sections
    if (sections && Array.isArray(sections)) {
      const validSections = sections.filter((section) => section.sectionName?.trim());
      if (validSections.length !== sections.length) {
        return res.status(400).json({
          message: "Some sections are missing sectionName. Please fix them.",
        });
      }

      // Check for duplicate section names within the request payload
      const sectionNames = new Set();
      for (const section of validSections) {
        const trimmedName = section.sectionName.trim();
        if (sectionNames.has(trimmedName)) {
          return res.status(400).json({
            message: `Duplicate section name `,
          });
        }
        sectionNames.add(trimmedName);
      }

    }

    // Proceed with saving the course
    const course = new Course({
      courseName: courseName.trim(),
      courseCode: courseCode.trim(),
      description: description.trim(),
      term: term.trim(),
    });

    await course.save();

    // Save sections if valid
    let sectionIds = [];
    if (sections && Array.isArray(sections)) {
      const validSections = sections.filter((section) => section.sectionName?.trim());

      sectionIds = await Promise.all(
        validSections.map(async (section) => {
          const newSection = new Section({
            sectionName: section.sectionName.trim(),
            instructor: section.instructor || null,
            course: course._id,
            day: section.day,
            timeSlot: section.timeSlot,
          });
          const savedSection = await newSection.save();
          return savedSection._id;
        })
      );
    }

    // Update course with section IDs
    course.sections = sectionIds;
    await course.save();

    // Populate sections with instructor details (firstName, lastName, email)
    const populatedCourse = await Course.findById(course._id).populate({
      path: "sections",
      populate: {
        path: "instructor",
        select: "firstName lastName email", // Select only necessary fields
      },
    });

    res.status(201).json({
      message: "Course and sections added successfully!",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Error adding course and sections:", error);
    res.status(500).json({
      message: "Failed to add course and sections",
      error: error.message,
    });
  }
};



  // Update course by ID
  exports.updateCourse = async (req, res) => {
    const courseId = req.params.id;
    const { courseName, courseCode, description, term, sections } = req.body;
  
    try {
      // Step 1: Create or update sections and collect their ObjectIds
      const sectionIds = await Promise.all(
        sections.map(async (section) => {
          if (section._id) {
            // If the section already exists, update it
            const updatedSection = await Section.findByIdAndUpdate(
              section._id,
              { sectionName: section.sectionName, instructor: section.instructor },
              { new: true, runValidators: true }
            );
            return updatedSection._id;
          } else {
            // If the section doesn't exist, create a new one
            const newSection = new Section({
              sectionName: section.sectionName,
              instructor: section.instructor,
              course: courseId,
            });
            const savedSection = await newSection.save();
            return savedSection._id;
          }
        })
      );
  
      // Step 2: Update the course
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          courseName,
          courseCode,
          description,
          term,
          sections: sectionIds,
        },
        { new: true, runValidators: true }
      ).populate({
        path: "sections",
        populate: { path: "instructor", select: "firstName lastName email" },
      });
  
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      res.status(200).json({ message: "Course updated successfully", course: updatedCourse });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Error updating course", error: error.message });
    }
  };
  
  
  

  exports.deleteCourse = async (req, res) => {
    const courseId = req.params.id;
  
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      await Section.deleteMany({ course: courseId });
      await course.deleteOne();
  
      res.status(200).json({ message: "Course and associated sections deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Error deleting course", error: error.message });
    }
  };
  