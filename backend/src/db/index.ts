import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const connectDB = async (): Promise<void>=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("DataBase Connected Successfully...");
    } catch (error) {
        if (error instanceof Error) {
            console.error("DB Connection failed.", error.message);
        }else{
            console.error("DB Connection failed.", error);
        }
        process.exit(1);
    }
}

export default connectDB;