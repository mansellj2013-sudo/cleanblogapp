import BlogPost from "../models/BlogPost.js";
import User from "../models/User.js";
import Image from "../models/Image.js";

// Show edit form
export const showEdit = async (req, res) => {
  const blogpost = await BlogPost.findById(req.params.id)
    .populate("userId")
    .populate("imageId");

  // Check if post exists
  if (!blogpost) {
    return res.redirect("/");
  }

  // Check if user is the owner of the post
  if (blogpost.userId._id.toString() !== req.session.userId.toString()) {
    return res.redirect("/");
  }

  const errors = req.session.errors || [];
  const formData = req.session.formData || {};

  // Clear session data after retrieving it
  req.session.errors = null;
  req.session.formData = null;

  res.render("edit", {
    blogpost,
    errors,
    formData,
    req,
  });
};

// Update post
export const updatePost = async (req, res) => {
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

    const errors = [];

    if (!req.body.title || req.body.title.trim() === "") {
      errors.push("Title is required");
    }
    if (!req.body.body || req.body.body.trim() === "") {
      errors.push("Body is required");
    }

    // Validate image file type if uploaded
    if (req.files && req.files.image) {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      
      const file = req.files.image;
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      
      if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(fileExtension)) {
        errors.push("Only image files (JPG, PNG, GIF, WebP) are allowed");
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push("Image file size must be less than 5MB");
      }
    }

    if (errors.length > 0) {
      req.session.errors = errors;
      req.session.formData = req.body;
      return res.redirect(`/posts/${req.params.id}/edit`);
    }

    let imageId = blogpost.imageId;

    // Handle new image upload
    if (req.files && req.files.image) {
      try {
        let image = req.files.image;

        // Create new image document in MongoDB
        const savedImage = await Image.create({
          filename: image.name,
          contentType: image.mimetype,
          data: image.data,
        });

        // Delete old image if it exists
        if (blogpost.imageId) {
          await Image.findByIdAndDelete(blogpost.imageId);
        }

        imageId = savedImage._id;
      } catch (error) {
        console.log("Error saving image:", error);
        // Continue without updating image if upload fails
      }
    }

    // Update the post
    await BlogPost.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      imageId: imageId,
    });

    res.redirect(`/post/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
