const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructorController");

router.post("/login", instructorController.loginInstructor);
router.get("/courses/:instructorId", instructorController.getInstructorAssignedCourses);
router.get("/all", instructorController.getAllInstructors);
router.post("/add", instructorController.addInstructor);
router.put("/:id", instructorController.updateInstructor);
router.delete("/:id", instructorController.deleteInstructor);
router.post("/change-password", instructorController.changePassword);
module.exports = router;
