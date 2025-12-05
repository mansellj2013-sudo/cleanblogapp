import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
  title: String,
  body: String,
  username: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  datePosted: {
    type: Date,
    default: new Date(),
  },
  imageId: {
    type: Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
});

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
export default BlogPost;
