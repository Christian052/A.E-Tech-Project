const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("[db] No MONGO_URI set — active with in-memory mock fallback");
    return null;
  }

  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[db] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn("[db] connection error (falling back to mock store):", err.message);
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[db] disconnected");
  });

  return mongoose.connection;
}

function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDbConnected };
