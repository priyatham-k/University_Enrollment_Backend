const Admin = require("../models/Admin");

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });

    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.status(200).json({ message: "Admin login successful", user: admin });
  } catch (error) {
    res.status(500).json({ message: "Error logging in admin", error });
  }
};
