import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function cleanupSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get the sessions collection
    const db = mongoose.connection.db;
    const sessionsCollection = db.collection("sessions");

    // Delete sessions with null sessionId
    const result = await sessionsCollection.deleteMany({ sessionId: null });
    console.log(`Deleted ${result.deletedCount} corrupted session records`);

    // Drop the unique index on sessionId to prevent null key conflicts
    try {
      await sessionsCollection.dropIndex("sessionId_1");
      console.log("Dropped sessionId unique index");
    } catch (indexError) {
      console.log("Index may not exist:", indexError.message);
    }

    // List remaining sessions
    const count = await sessionsCollection.countDocuments();
    console.log(`Remaining sessions: ${count}`);

    // List all indexes
    const indexes = await sessionsCollection.getIndexes();
    console.log("Current indexes:", Object.keys(indexes));

    await mongoose.disconnect();
    console.log("Cleanup complete");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanupSessions();
