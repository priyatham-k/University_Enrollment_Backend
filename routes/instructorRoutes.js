const express = require('express');
const insFunc = require('../controllers/instructorController');

const router = express.Router();

// Define routes
router.post('/add', insFunc.addInstructor); // Add new instructor
router.post('/login', insFunc.loginInstructor);
router.get('/instructors', insFunc.getAllInstructors);
router.delete('/instructors/:id', insFunc.deleteInstructor);
// Add more routes as needed
router.put('/instructors/:id', insFunc.updateInstructor);
module.exports = router;
