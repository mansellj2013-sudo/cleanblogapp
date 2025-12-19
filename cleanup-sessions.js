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
    
    // List remaining sessions
    const count = await sessionsCollection.countDocuments();
    console.log(`Remaining sessions: ${count}`);
    
    await mongoose.disconnect();
    console.log("Cleanup complete");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanupSessions();
