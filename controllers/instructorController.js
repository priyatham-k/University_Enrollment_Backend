const Instructor = require("../models/Instructor"); // Ensure the path is correct

exports.addInstructor = async (req, res) => {
  const { name, email, password, department } = req.body;

  // Validate incoming data (optional but recommended)
  if (!name || !email || !password || !department) {
    return res.status(400).send("All fields are required.");
  }

  const newInstructor = new Instructor({ name, email, password, department });

  try {
    await newInstructor.save();
    res.status(201).json({
      message: "Instructor added successfully.",
      instructor: newInstructor,
    });
  } catch (error) {
    // More detailed error handling
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "Instructor already added." });
    }
    res.status(500).send("Error adding instructor: " + error.message);
  }
};

exports.loginInstructor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const instructor = await Instructor.findOne({ email, password });
    if (!instructor) {
      return res.status(401).send("Invalid credentials.");
    }

    res.status(200).send("Instructor logged in successfully.");
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
};
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find(); // Retrieves all instructors
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).send("Error fetching instructors: " + error.message);
  }
};
exports.deleteInstructor = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const deletedInstructor = await Instructor.findByIdAndDelete(instructorId);

    if (!deletedInstructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.json({
      message: "Instructor deleted successfully",
      instructor: deletedInstructor,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting instructor", error });
  }
}; // Edit (Update) instructor by ID
exports.updateInstructor = async (req, res) => {
  const { name, email,  department } = req.body;
  const instructorId = req.params._id;

  try {
    // Find the instructor by ID and update with the new data
    const updatedInstructor = await Instructor.findByIdAndUpdate(
      instructorId,
      { name, email,  department },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedInstructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.json({
      message: "Instructor updated successfully",
      instructor: updatedInstructor,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating instructor", error });
  }
};
