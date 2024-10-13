const GraduateApplication = require("../models/GraduateApplication");

// Submit application
exports.submitApplication = async (req, res) => {
  const {
    studentId, // From the request body
    studentName,
    degreeProgram,
    major,
    contactEmail,
    contactPhone,
    season,
    englishTest,
  } = req.body;

  try {
    const application = new GraduateApplication({
      studentId,
      studentName,
      degreeProgram,
      major,
      contactEmail,
      contactPhone,
      season,
      englishTest,
    });

    await application.save();
    res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to submit application", error: error.message });
  }
};
exports.getApplicationStatus = async (req, res) => {
  const studentId = req.params.studentId; // Retrieve studentId from URL params

  try {
    const application = await GraduateApplication.findOne({ studentId });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ applicationStatus: application.applicationStatus });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching application status",
        error: error.message,
      });
  }
};
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await GraduateApplication.find(); // Retrieve all applications from the database

    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    res.status(200).json(applications); // Return the list of applications
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching applications", error: error.message });
  }
};
exports.approveApplication = async (req, res) => {
    try {
      const application = await GraduateApplication.findById(req.params.id); // Find application by ID
  
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
  
      application.applicationStatus = "approved"; // Update status to 'approved'
      await application.save();
  
      res.status(200).json({ message: "Application approved", application });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error approving application", error: error.message });
    }
  };
  exports.rejectApplication = async (req, res) => {
    try {
      const application = await GraduateApplication.findById(req.params.id); // Find application by ID
  
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
  
      application.applicationStatus = "rejected"; // Update status to 'rejected'
      await application.save();
  
      res.status(200).json({ message: "Application rejected", application });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error rejecting application", error: error.message });
    }
  };
  