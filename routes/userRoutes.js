// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Register route
router.post("/register", userController.register);

// Login route
router.post("/login", userController.login);
router.post("/addCourse/:userId", userController.registerCourse);
router.post("/dropCourse/:userId", userController.dropCourse);
router.post("/updatePayments/:userId", userController.courcepayments);
module.exports = router;
