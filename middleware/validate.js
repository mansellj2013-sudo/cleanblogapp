// middleware to validate blog post data
const validateMiddleWare = (req, res, next) => {
  const errors = [];

  if (req.body.title == null || req.body.title === "") {
    errors.push("Title is required");
  }
  if (req.body.body == null || req.body.body === "") {
    errors.push("Body is required");
  }
  if (req.body.username == null || req.body.username === "") {
    errors.push("Username is required");
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
    // Store errors and form data in session
    req.session.errors = errors;
    req.session.formData = req.body;
    return res.redirect("/posts/new");
  }

  // Clear any previous errors on success
  req.session.errors = null;
  req.session.formData = null;
  next();
};

export default validateMiddleWare;
