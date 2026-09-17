const mongoose = require("mongoose");
const config = require("./environment");

const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error("MONGODB_URI is not configured in .env");
    }

    const isAtlas = config.mongoUri.startsWith("mongodb+srv://") || config.mongoUri.includes("ssl=true") || config.mongoUri.includes("tls=true");

    const connectOptions = {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      w: "majority",
      ...(config.mongoDbName ? { dbName: config.mongoDbName } : {}),
      ...(isAtlas ? { tls: true, secureProtocol: "TLSv1_2_method" } : {}),
    };

    console.log(`[MongoDB] Connecting to MongoDB (${isAtlas ? "Atlas" : "Local"})...`);

    await mongoose.connect(config.mongoUri, connectOptions);

    console.log("MongoDB connected:", mongoose.connection.host);
    console.log("MongoDB database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnect failed:", error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
