import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check whether the Authorization header exists
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return res.status(401).json({
      message: 'Not authorized, no token',
    });
  }

  const token = authHeader.split(/\s+/)[1];

  // Reject an empty or malformed token
  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, no token',
    });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the authenticated user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'Not authorized, user not found',
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    // Invalid, expired, or malformed tokens are expected auth failures.
   if (
    error instanceof jwt.JsonWebTokenError ||
    error instanceof jwt.TokenExpiredError ||
    error instanceof jwt.NotBeforeError
  ) {
    return res.status(401).json({message: 'Not authorized, token failed',});
  }

    // Log unexpected server/database errors only.
    console.error('Authentication error:', error);

    return res.status(500).json({
      message: 'Authentication failed due to a server error',
    });
  }
});

export { protect };
