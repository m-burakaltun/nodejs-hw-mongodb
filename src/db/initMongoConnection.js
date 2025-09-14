import mongoose from "mongoose";

export async function initMongoConnection() {
  try {
    const user = process.env.MONGODB_USER;
    const password = process.env.MONGODB_PASSWORD;
    const url = process.env.MONGODB_URL;
    const db = process.env.MONGODB_DB;

    const uri = `mongodb+srv://${user}:${password}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`;

    await mongoose.connect(uri);

    console.log(" Mongo connection successfully established!");
  } catch (error) {
    console.error(" Mongo connection error:", error.message);
    process.exit(1);
  }
}
