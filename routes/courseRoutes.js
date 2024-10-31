// routes/courseRoutes.js

const express = require("express");
const courses = require("../controllers/courseController");

const router = express.Router();

// Route to add a new course
router.post("/add", courses.addCourse);
router.get("/allCourses", courses.getAllCourses);
router.put("/:id", courses.updateCourse);
router.put("/:id/instructor", courses.assignInstructor);
router.put("/:id/remove-instructor", courses.removeInstructor);
router.get('/instructor/:instructorId', courses.getCoursesByInstructor);
// Route to delete a course
router.delete("/:id", courses.deleteCourse);
// Export the router
module.exports = router;
