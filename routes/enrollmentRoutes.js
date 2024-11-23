const express = require("express");
const router = express.Router();
const { getAllEnrollments } = require("../controllers/enrollmentController");

router.get("/all", getAllEnrollments);

module.exports = router;
