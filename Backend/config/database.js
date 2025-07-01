import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://Himanshu:DYCb0lWNCBtxcwUL@cluster0.xbqv2.mongodb.net/finance-tracker"); 
    console.log(" MongoDB connected successfully");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  }
};

connectDB();
