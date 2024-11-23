const express = require("express");
const router = express.Router();
const { processPaymentAndEnrollments, getAllPayments } = require("../controllers/paymentController");

// Existing GET route
router.get("/all", getAllPayments);

// New POST route for processing payments and enrollments
router.post("/process", processPaymentAndEnrollments);

module.exports = router;
