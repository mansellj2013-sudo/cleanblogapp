// controllers/storePost.js
import BlogPost from "../models/BlogPost.js";
import Image from "../models/Image.js";

// controller to handle storing a new blog post
export default async (req, res) => {
  let imageId = null;

  // Only process image if one was uploaded
  if (req.files && req.files.image) {
    try {
      let image = req.files.image;

      // Create image document in MongoDB
      const savedImage = await Image.create({
        filename: image.name,
        contentType: image.mimetype,
        data: image.data,
      });

      imageId = savedImage._id;
    } catch (error) {
      console.log("Error saving image:", error);
      // Continue without image if upload fails
    }
  }

  try {
    await BlogPost.create({
      title: req.body.title,
      body: req.body.body,
      username: req.body.username,
      userId: req.session.userId,
      imageId: imageId,
      datePosted: new Date(),
    });
    res.redirect("/");
  } catch (error) {
    console.log("Error creating post:", error);
    res.redirect("/posts/new");
  }
};
