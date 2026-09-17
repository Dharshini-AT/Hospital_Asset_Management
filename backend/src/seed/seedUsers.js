const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { connectDB } = require("../config/db");
const User = require("../models/User");

const {
  AVAILABILITY_STATUS,
  ACCOUNT_STATUS
} = require("../utils/constants");

const usersData = require("./data/users.json");

/**
 * Seed users into MongoDB.
 *
 * clearExisting = true
 *   Deletes existing users before inserting finalized users.
 *
 * clearExisting = false
 *   Used by seedDatabase.js after it has already cleared the database.
 */
async function seedUsers(clearExisting = true) {
  console.log("[Seed Users] Starting...");

  if (clearExisting) {
    console.log("[Seed Users] Removing existing users...");
    await User.deleteMany({});
  }

  if (!Array.isArray(usersData) || usersData.length === 0) {
    throw new Error("users.json is empty or invalid.");
  }

  const userDocs = await Promise.all(
    usersData.map(async (u) => {
      if (!u.userId) {
        throw new Error("User ID is missing in users.json.");
      }

      if (!u.email) {
        throw new Error(`Email is missing for user ${u.userId}.`);
      }

      if (!u.password) {
        throw new Error(`Password is missing for user ${u.userId}.`);
      }

      if (!u.role) {
        throw new Error(`Role is missing for user ${u.userId}.`);
      }

      /*
       * IMPORTANT:
       * The password from users.json is NEVER stored directly.
       * It is converted into a bcrypt hash first.
       */
      const passwordHash = await bcrypt.hash(
        String(u.password),
        10
      );

      return {
        userId: u.userId,
        name: u.name,
        email: String(u.email).trim().toLowerCase(),

        phone: String(u.phone ?? ""),

        // MongoDB receives the bcrypt hash, not the plain password.
        password: passwordHash,

        role: u.role,

        designation: u.designation || "",

        department: u.department || "General",

        specialization: u.specialization || "",

        availabilityStatus:
          u.availabilityStatus ||
          AVAILABILITY_STATUS.AVAILABLE,

        accountStatus:
          u.accountStatus ||
          ACCOUNT_STATUS.ACTIVE,

        profilePhoto: u.profilePhoto || "",

        lastLogin: null
      };
    })
  );

  /*
   * Check duplicate User IDs before inserting.
   */
  const userIds = userDocs.map((u) => u.userId);
  const uniqueUserIds = new Set(userIds);

  if (userIds.length !== uniqueUserIds.size) {
    throw new Error("Duplicate userId found in users.json.");
  }

  /*
   * Check duplicate emails before inserting.
   */
  const emails = userDocs.map((u) => u.email);
  const uniqueEmails = new Set(emails);

  if (emails.length !== uniqueEmails.size) {
    throw new Error("Duplicate email found in users.json.");
  }

  const users = await User.insertMany(userDocs);

  console.log("--------------------------------------------");
  console.log("[Seed Users] Users inserted successfully.");
  console.log(`[Seed Users] Total users: ${users.length}`);
  console.log("--------------------------------------------");

  users.forEach((user) => {
    console.log(
      `${user.userId} | ${user.role} | ${user.email}`
    );
  });

  return users;
}


/*
 * Allows this file to be run directly:
 *
 * node seed/seedUsers.js
 */
async function runStandalone() {
  try {
    await connectDB();

    console.log("[Seed Users] Connected to MongoDB Atlas.");

    await seedUsers(true);

    console.log("[Seed Users] Completed successfully.");
  } catch (error) {
    console.error("[Seed Users] Failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

if (require.main === module) {
  runStandalone();
}

module.exports = seedUsers;