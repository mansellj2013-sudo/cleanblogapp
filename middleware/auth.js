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
  if (!req.session.userId) {
    next();
  } else {
    res.redirect("/");
  }
};
