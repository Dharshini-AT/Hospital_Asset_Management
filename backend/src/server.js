const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");
const config = require("./config/environment");

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log("====================================================");
      console.log(" Hospital Asset Management System API Server");
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Server: http://localhost:${config.port}`);
      console.log(` Health: http://localhost:${config.port}/api/health`);
      console.log(" MongoDB: Connected to Atlas");
      console.log("====================================================");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (error) => {
      console.error(`[Unhandled Rejection]: ${error.message}`);

      server.close(async () => {
        await disconnectDB();
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", async (error) => {
      console.error(`[Uncaught Exception]: ${error.message}`);

      await disconnectDB();
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\nShutting down server...");
      await disconnectDB();
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("\nSIGTERM received. Shutting down...");
      await disconnectDB();
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();