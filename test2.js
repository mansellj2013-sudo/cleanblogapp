//import mongoose
import mongoose from "mongoose";

// import the model we just created
// BlogPost represents the BlogPosts collection in the database
import TestDB from "./models/TestDB.js";

// if my_database doesn't exist, it will be created for us
mongoose.connect("mongodb://localhost/TestDB");

// to create a new BlogPost doc in our database, we will use
// a function in our model called create

(async () => {
  try {
    const testDoc = await TestDB.create({
      //author: ObjectId,
      title: "The Mythbuster's Guide to Saving Money on Energy Bills",
      body: "Once you get past the beginner-level energy-saving stuff, a whole new world of thrifty nerdery opens up. Here are some secrets to copping a load of money off your utilities bills. ",
    });
    console.log(testDoc);
  } catch (error) {
    console.log(error);
  }
})();
