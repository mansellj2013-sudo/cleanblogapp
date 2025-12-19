import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const showLogin = (req, res) => {
  res.render("login");
};

export const loginUser = async (req, res) => {
  try {
    console.log("[LOGIN] Attempting login for email:", req.body.email);
    
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      console.log("[LOGIN] User not found:", req.body.email);
      return res.redirect("/login");
    }

    console.log("[LOGIN] User found:", user.email);

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      console.log("[LOGIN] Password mismatch for user:", user.email);
      return res.redirect("/login");
    }

    console.log("[LOGIN] Password match successful for:", user.email);

    // Store user in session
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    req.session.user = user;

    console.log("[LOGIN] Session userId set to:", req.session.userId);

    // Ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.log("[LOGIN] Session save error:", err);
        return res.redirect("/login");
      }
      console.log("[LOGIN] Session saved successfully. Redirecting to home.");
      res.redirect("/");
    });
  } catch (error) {
    console.log("[LOGIN] Error:", error);
    res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.redirect("/login");
  });
};
