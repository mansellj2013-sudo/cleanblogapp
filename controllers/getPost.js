import BlogPost from "../models/BlogPost.js";

// controller to handle displaying a single blog post
export default async (req, res) => {
  const blogpost = await BlogPost.findById(req.params.id)
    .populate("userId")
    .populate("imageId");
  console.log(blogpost);
  res.render("post", {
    blogpost,
    req,
  });
};
