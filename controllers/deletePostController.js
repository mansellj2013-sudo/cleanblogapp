import BlogPost from "../models/BlogPost.js";

export const deletePost = async (req, res) => {
  try {
    const blogpost = await BlogPost.findById(req.params.id);

    // Check if post exists
    if (!blogpost) {
      return res.redirect("/");
    }

    // Check if user is the owner of the post
    if (blogpost.userId.toString() !== req.session.userId.toString()) {
      return res.redirect("/");
    }

    // Delete the post
    await BlogPost.findByIdAndDelete(req.params.id);

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
