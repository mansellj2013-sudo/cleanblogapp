import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const showRegister = (req, res) => {
  const errors = req.session.errors || [];
  const formData = req.session.formData || {};

  // Clear session data after retrieving it
  req.session.errors = null;
  req.session.formData = null;

  res.render("register", {
    errors,
    formData,
    req,
  });
};

export const storeUser = async (req, res) => {
  try {
    const errors = [];

    // Validate input fields
    if (!req.body.username || req.body.username.trim() === "") {
      errors.push("Username is required");
    }
    if (!req.body.email || req.body.email.trim() === "") {
      errors.push("Email is required");
    }
    if (!req.body.password || req.body.password.trim() === "") {
      errors.push("Password is required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (existingUser) {
      if (existingUser.email === req.body.email) {
        errors.push("Email already registered");
      }
      if (existingUser.username === req.body.username) {
        errors.push("Username already taken");
      }
    }

    if (errors.length > 0) {
      req.session.errors = errors;
      req.session.formData = req.body;
      return res.redirect("/register");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    const errors = ["An error occurred during registration. Please try again."];
    req.session.errors = errors;
    req.session.formData = req.body;
    res.redirect("/register");
  }
};
