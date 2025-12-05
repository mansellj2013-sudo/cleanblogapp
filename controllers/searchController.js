import BlogPost from "../models/BlogPost.js";

export const showSearch = async (req, res) => {
  res.render("search", { req, results: null, query: "" });
};

export const searchPosts = async (req, res) => {
  try {
    const query = req.body.query || req.query.query || "";

    if (!query || query.trim() === "") {
      return res.render("search", { req, results: [], query: "" });
    }

    // Search in title and body using regex for case-insensitive search
    const results = await BlogPost.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { body: { $regex: query, $options: "i" } },
      ],
    }).populate("userId");

    res.render("search", { req, results, query });
  } catch (error) {
    console.log(error);
    res.render("search", { req, results: [], query: req.body.query || "" });
  }
};
