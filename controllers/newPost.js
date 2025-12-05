//This file will contain the route handler for creating a new blog post
import User from "../models/User.js";

export default async (req, res) => {
  const errors = req.session.errors || [];
  const formData = req.session.formData || {};

  // Get the logged-in user's data
  const user = await User.findById(req.session.userId);

  // Clear session data after retrieving it
  req.session.errors = null;
  req.session.formData = null;

  res.render("create", {
    errors,
    formData,
    user,
    req,
  });
};
