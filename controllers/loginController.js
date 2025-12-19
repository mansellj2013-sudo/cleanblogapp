import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const showLogin = (req, res) => {
  res.render("login");
};

export const loginUser = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    console.log(
      "[LOGIN] Attempting login - Raw email:",
      JSON.stringify(req.body.email),
      "Trimmed/lower:",
      email,
      "Length:",
      email.length
    );

    // Try case-insensitive search
    const user = await User.findOne({
      email: { $regex: "^" + email + "$", $options: "i" },
    });

    if (!user) {
      console.log("[LOGIN] User not found with email:", email);
      // Log all users in database for debugging
      const allUsers = await User.find({}, { email: 1 });
      console.log(
        "[LOGIN] All users in DB:",
        allUsers.map((u) => ({ email: u.email, length: u.email.length }))
      );
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
    console.log("[LOGIN] Session ID:", req.sessionID);

    // Ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("[LOGIN] Session save error:", err);
        console.log("[LOGIN] Redirecting to login due to session save error");
        return res.redirect("/login");
      }
      console.log(
        "[LOGIN] Session saved successfully. SessionID:",
        req.sessionID
      );
      console.log("[LOGIN] About to redirect to /");
      // Force express-session to send Set-Cookie header
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
