/**
 * Session Validation Middleware
 * Validates that a user session exists and is valid for access to the second application.
 * Works with MongoDB session store to ensure consistency across multiple instances.
 */

export const validateSessionForGateway = (req, res, next) => {
  // Check if user session exists
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "No valid session found. Please log in first.",
    });
  }

  // Session is valid, continue
  next();
};

/**
 * Session Info Middleware
 * Provides session information to the second application.
 * This allows the second app to verify user details if needed.
 */
export const attachSessionInfo = (req, res, next) => {
  // Attach session info to response headers for the proxied request
  if (req.session && req.session.userId) {
    req.headers["x-session-user-id"] = req.session.userId;
    req.headers["x-session-user-email"] = req.session.userEmail || "";
    req.headers["x-session-timestamp"] = new Date().toISOString();
  }

  next();
};

/**
 * Session Refresh Middleware
 * Refreshes session timeout on each request.
 * Ensures active users maintain their session.
 */
export const refreshSession = (req, res, next) => {
  if (req.session) {
    req.session.touch(); // Update session timestamp
  }

  next();
};

export default validateSessionForGateway;
