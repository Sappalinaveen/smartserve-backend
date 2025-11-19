const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

module.exports = async function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user basics to req.user
    req.user = { id: payload.id, email: payload.email };
    // optionally load full user document (uncomment if needed)
    // req.userDoc = await User.findById(payload.id).select("-passwordHash");
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
