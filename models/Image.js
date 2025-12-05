import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model("Image", imageSchema);
