// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Middleware to check if user is NOT authenticated
export const isNotAuthenticated = (req, res, next) => {
  console.log("[AUTH] isNotAuthenticated check - userId:", req.session.userId, "path:", req.path, "method:", req.method);
  if (!req.session.userId) {
    console.log("[AUTH] User not authenticated, allowing access to", req.path);
    next();
  } else {
    console.log("[AUTH] User already authenticated, redirecting to home");
    res.redirect("/");
  }
};
