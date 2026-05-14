import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.DATABASE_URL;

  if (!mongoURI) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  await mongoose.connect(mongoURI);
  console.log(`Database connected`);
};

export default connectDB;
