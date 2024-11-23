const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/login", studentController.loginStudent);
router.get("/students", studentController.getAllStudents);
// GET enrolled classes for a student
router.get("/enrolledClasses/:studentId", studentController.getEnrolledClasses);

// POST drop a course
router.post("/dropCourse/:studentId", studentController.dropCourse);
module.exports = router;
