import mongoose from "mongoose";

import TestDB from "./models/TestDB.js";

mongoose.connect("mongodb://localhost/TestDB");

(async () => {
  try {
    const result = await TestDB.find({});
    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
