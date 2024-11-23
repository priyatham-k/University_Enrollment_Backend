const express = require("express");
const { addCourse, getAllCourses ,updateCourse,deleteCourse  } = require("../controllers/courseController");
const router = express.Router();

router.post("/add", addCourse); // Add a course
router.get("/all", getAllCourses); // Get all courses
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
module.exports = router;
