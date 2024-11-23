const express = require("express");
const router = express.Router();
const SectionController = require("../controllers/sectionController");
router.get(
  "/:sectionId/students",
  SectionController.getStudentsBySection
);
module.exports = router;
