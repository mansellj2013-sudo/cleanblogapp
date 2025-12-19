import BlogPost from "../models/BlogPost.js";

// controller to handle displaying all blog posts on home page
export default async (req, res) => {
  console.log("[HOME] Session userId:", req.session.userId);
  console.log("[HOME] Session object:", {
    sessionID: req.sessionID,
    userId: req.session.userId,
    userEmail: req.session.userEmail,
    hasSession: !!req.session,
  });

  const blogposts = await BlogPost.find({}).populate("userId");
  res.render("index", {
    blogposts,
    req,
  });
};
