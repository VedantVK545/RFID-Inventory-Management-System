const express = require("express");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/userinfo", isAuthenticated, (req, res) => {
  res.json({
    username: req.session.username || "Guest",
    role: req.session.role || "user",
  });
});

router.get("/getallusrs", isAuthenticated, async (req, res) => {
  try {
    // If user is admin, return full user details
    if (req.session.role === "admin") {
      const users = await user.collection
        .find(
          {},
          { projection: { username: 1, email: 1, role: 1, created: 1 } }
        )
        .toArray();
      return res.json(users);
    }
    // If regular user, only return the count
    else {
      const count = await user.countDocuments({});
      return res.json({ count: count });
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/createuser", isAuthenticated, isAdmin, async (req, res) => {
  const { username, email, password, role } = req.body; // Use req.body to get the data
  try {
    // Check if the username already exists
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if the email already exists
    const existingEmail = await user.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Proceed to create the new user
    const newUser = new user({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/deleteuser", isAuthenticated, isAdmin, async (req, res) => {
  const { username } = req.body; // Use req.body to get the data
  if (username === req.session.username) {
    return res
      .status(400)
      .json({ error: "You cannot delete your own account" });
  }
  try {
    // Check if the username exists
    const existingUser = await user.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ error: "Username does not exist" });
    }

    // Proceed to delete the user
    await user.deleteOne({ username });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
