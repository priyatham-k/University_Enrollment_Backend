const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/login", studentController.loginStudent);
router.get("/students", studentController.getAllStudents);
// GET enrolled classes for a student
router.get("/enrolledClasses/:studentId", studentController.getEnrolledClasses);
router.post("/register", studentController.registerStudent);
router.put("/:id", studentController.updateStudent);         // Update student by ID
router.delete("/:id", studentController.deleteStudent);  
// POST drop a course
router.post("/dropCourse/:studentId", studentController.dropCourse);
router.post("/change-password", studentController.changePassword);
module.exports = router;
