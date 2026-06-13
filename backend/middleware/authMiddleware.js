const jwt = require("jsonwebtoken");

// 1. Core Token Verification Middleware (Kept exactly as you wrote it)
const verifyToken = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied. Unauthorized terminal session." });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded token payload (ID and Role)
    next(); 
  } catch (error) {
    console.error("JWT middleware verification crash details:", error.message);
    res.status(400).json({ message: "Invalid session token security credentials." });
  }
};

// ======================================================================
// 🛠️ ADDED FOR PHASE 7: Role-Based Access Control Gatekeeper
// ======================================================================
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Safety check: ensure token verification ran before this middleware
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Check if the user's role matches any of the allowed roles for the route
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Forbidden: Your profile lacks required security clearance level." 
      });
    }

    next(); // Access granted! Move to the actual route logic
  };
};

// Export BOTH middleware utilities so they can be imported inside your routes
module.exports = {
  verifyToken,
  authorize
};