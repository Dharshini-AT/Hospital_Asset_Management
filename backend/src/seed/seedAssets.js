const mongoose = require("mongoose");

const { connectDB } = require("../config/db");
const Asset = require("../models/Asset");

const {
  ASSET_STATUS
} = require("../utils/constants");

const assetsData = require("./data/assets.json");

/**
 * Convert a value into a JavaScript Date.
 * Empty values become null.
 */
const toDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return date;
};


/**
 * Seed assets into MongoDB.
 *
 * clearExisting = true
 *   Deletes existing assets before inserting.
 *
 * clearExisting = false
 *   Used by seedDatabase.js.
 */
async function seedAssets(clearExisting = true) {
  console.log("[Seed Assets] Starting...");

  if (clearExisting) {
    console.log("[Seed Assets] Removing existing assets...");
    await Asset.deleteMany({});
  }

  if (!Array.isArray(assetsData) || assetsData.length === 0) {
    throw new Error("assets.json is empty or invalid.");
  }

  const assetDocs = assetsData.map((a) => {
    if (!a.assetId) {
      throw new Error("Asset ID is missing in assets.json.");
    }

    if (!a.assetName) {
      throw new Error(
        `Asset name is missing for ${a.assetId}.`
      );
    }

    return {
      assetId: a.assetId,

      assetName: a.assetName,

      assetType: a.assetType || "",

      category: a.category || "",

      serialNumber: a.serialNumber || "",

      manufacturer: a.manufacturer || "",

      model: a.model || "",

      description: a.description || "",

      purchaseDate: toDate(a.purchaseDate),

      purchaseCost: Number(a.purchaseCost) || 0,

      supplier: a.supplier || "",

      installationDate: toDate(a.installationDate),

      warrantyStartDate: toDate(a.warrantyStartDate),

      warrantyEndDate: toDate(a.warrantyEndDate),

      department: a.department || "",

      ward: a.ward || "",

      room: a.room || "",

      location: a.location || "",

      maintenanceFrequency:
        a.maintenanceFrequency || "QUARTERLY",

      maintenanceType:
        a.maintenanceType || "PREVENTIVE",

      lastMaintenanceDate:
        toDate(a.lastMaintenanceDate),

      nextMaintenanceDate:
        toDate(a.nextMaintenanceDate),

      currentStatus:
        a.currentStatus || ASSET_STATUS.AVAILABLE,

      currentCondition:
        a.currentCondition || "GOOD",

      criticality:
        a.criticality || "MEDIUM",

      /*
       * This field was added to your finalized Asset model.
       */
      currentRemarks:
        a.currentRemarks || ""
    };
  });


  /*
   * Check duplicate Asset IDs before insertion.
   */
  const assetIds = assetDocs.map((a) => a.assetId);
  const uniqueAssetIds = new Set(assetIds);

  if (assetIds.length !== uniqueAssetIds.size) {
    throw new Error(
      "Duplicate assetId found in assets.json."
    );
  }


  const assets = await Asset.insertMany(assetDocs);

  console.log("--------------------------------------------");
  console.log("[Seed Assets] Assets inserted successfully.");
  console.log(`[Seed Assets] Total assets: ${assets.length}`);
  console.log("--------------------------------------------");

  assets.forEach((asset) => {
    console.log(
      `${asset.assetId} | ${asset.assetName} | ${asset.currentStatus}`
    );
  });

  return assets;
}


/*
 * Allows this file to be run directly:
 *
 * node seed/seedAssets.js
 */
async function runStandalone() {
  try {
    await connectDB();

    console.log("[Seed Assets] Connected to MongoDB Atlas.");

    await seedAssets(true);

    console.log("[Seed Assets] Completed successfully.");
  } catch (error) {
    console.error("[Seed Assets] Failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

if (require.main === module) {
  runStandalone();
}

module.exports = seedAssets;