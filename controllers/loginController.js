import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const showLogin = (req, res) => {
  res.render("login");
};

export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.redirect("/login");
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.redirect("/login");
    }

    // Store user in session
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    req.session.user = user;

    // Ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.log("Session save error:", err);
        return res.redirect("/login");
      }
      res.redirect("/");
    });
  } catch (error) {
    console.log(error);
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
