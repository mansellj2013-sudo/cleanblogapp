import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TestDBSchema = new Schema({
  title: String,
  body: String,
});

const TestDB = mongoose.model("TestDB", TestDBSchema);
export default TestDB;
