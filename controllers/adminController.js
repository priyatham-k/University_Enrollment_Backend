const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Admin login successful",
      user: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in admin", error });
  }
};
