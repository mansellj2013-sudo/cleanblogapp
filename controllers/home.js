import BlogPost from "../models/BlogPost.js";

// controller to handle displaying all blog posts on home page
export default async (req, res) => {
  const blogposts = await BlogPost.find({}).populate("userId");
  console.log(blogposts);
  res.render("index", {
    blogposts,
    req,
  });
};
