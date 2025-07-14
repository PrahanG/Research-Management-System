const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // adjust path if different

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yoursecret");
    req.user = decoded; // contains id, email, role, name
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    // 3. Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || "yoursecret",
      { expiresIn: "1d" }
    );
        
    // 4. Set userId in session
    req.session.userId = user._id;

    // 5. Send the token
    res.json({ token });
    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /me (JWT-protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username role bio avatar');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /update (JWT-protected)
router.put('/update', authMiddleware, async (req, res) => {
  const { bio, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, avatar },
      { new: true }
    ).select('username role bio avatar');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
