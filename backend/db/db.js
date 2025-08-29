import { connect } from 'mongoose';

async function connectDB() {
  try {
    await connect("mongodb+srv://yg:vqWTQ96RaE1L2prr@nodeyg.sx9dr.mongodb.net/jobconnect");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export { connectDB };