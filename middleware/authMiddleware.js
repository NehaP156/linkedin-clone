// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
// Use the JWT secret key from .env
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  // Retrieve token from the 'Authorization' header (Bearer token)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expected format: "Bearer <token>"

  if (!token) return res.status(401).send("Access token missing");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid access token");
    req.user = user; // Attach the decoded user to the request for later use
    next();
  });
};

module.exports = authenticateToken;
