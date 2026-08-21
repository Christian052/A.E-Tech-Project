const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGO_URI || "mongodb+srv://Christian:Christian@2026@cluster0.wmujtnc.mongodb.net/aetech?retryWrites=true&w=majority&appName=Cluster0/aetech";

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`[db] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("[db] connection error:", err.message);
    // Non-fatal on boot: allow the API to still serve cached/static routes.
    // Individual routes that require DB will surface a 503.
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[db] disconnected");
  });

  return mongoose.connection;
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDbConnected };
