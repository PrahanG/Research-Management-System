const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Enable CORS for frontend (React)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json()); // Parse incoming JSON

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Optional: Connection event listeners for debug
mongoose.connection.on('error', err => {
  console.error("❌ Mongoose error:", err);
});
mongoose.connection.on('disconnected', () => {
  console.warn("⚠️ Mongoose disconnected");
});

// ✅ Test DB route
app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.send("✅ MongoDB is connected!");
  } catch (error) {
    res.status(500).send("❌ MongoDB not connected.");
  }
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port ${PORT}"));