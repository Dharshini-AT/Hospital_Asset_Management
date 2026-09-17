require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGODB_DB_NAME || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
