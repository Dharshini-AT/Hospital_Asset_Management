const mongoose = require("mongoose");

const { connectDB } = require("../config/db");

const User = require("../models/User");
const Asset = require("../models/Asset");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const MaintenanceHistory = require("../models/MaintenanceHistory");
const Notification = require("../models/Notification");

const {
  MAINTENANCE_STATUS,
  ASSET_STATUS,
  NOTIFICATION_TYPE,
  AVAILABILITY_STATUS
} = require("../utils/constants");

const usersData = require("./data/users.json");
const assetsData = require("./data/assets.json");
const requestsData = require("./data/maintenance_requests.json");
const historyData = require("./data/maintenance_history.json");
const notificationsData = require("./data/notifications.json");


/*
 * Import the separate seed functions.
 */
const seedUsers = require("./seedUsers");
const seedAssets = require("./seedAssets");


/**
 * Convert a value into a JavaScript Date.
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
 * Seed maintenance requests.
 */
async function seedMaintenanceRequests(
  userMap,
  assetMap
) {
  console.log("[Seed] Seeding maintenance requests...");

  if (
    !Array.isArray(requestsData) ||
    requestsData.length === 0
  ) {
    throw new Error(
      "maintenance_requests.json is empty or invalid."
    );
  }

  const requestDocs = requestsData.map((r) => {
    const assetObjectId = assetMap.get(r.assetId);

    const reporterObjectId = userMap.get(r.reportedBy);

    const assignedByObjectId = r.assignedBy
      ? userMap.get(r.assignedBy)
      : null;

    const technicianObjectId =
      r.assignedTechnician
        ? userMap.get(r.assignedTechnician)
        : null;

    if (!assetObjectId) {
      throw new Error(
        `Asset ${r.assetId} referenced by request ${r.requestId} does not exist.`
      );
    }

    if (!reporterObjectId) {
      throw new Error(
        `User ${r.reportedBy} referenced by request ${r.requestId} does not exist.`
      );
    }

    if (
      [
        MAINTENANCE_STATUS.ASSIGNED,
        MAINTENANCE_STATUS.IN_PROGRESS,
        MAINTENANCE_STATUS.COMPLETED
      ].includes(r.status) &&
      !technicianObjectId
    ) {
      throw new Error(
        `Request ${r.requestId} requires an assigned technician.`
      );
    }

    return {
      requestId: r.requestId,

      assetId: assetObjectId,

      reportedBy: reporterObjectId,

      assignedBy: assignedByObjectId,

      assignedTechnician: technicianObjectId,

      issueType: r.issueType || "GENERAL",

      issueDescription:
        r.issueDescription || "",

      priority:
        r.priority || "MEDIUM",

      status:
        r.status || MAINTENANCE_STATUS.PENDING,

      reportedAt:
        toDate(r.reportedAt) || new Date(),

      assignedAt:
        toDate(r.assignedAt),

      startedAt:
        toDate(r.startedAt),

      completedAt:
        toDate(r.completedAt),

      diagnosis:
        r.diagnosis || "",

      workPerformed:
        r.workPerformed || "",

      partsReplaced:
        r.partsReplaced || "",

      downtime:
        Number(r.downtime) || 0,

      maintenanceCost:
        Number(r.maintenanceCost) || 0,

      conditionAfterMaintenance:
        r.conditionAfterMaintenance || "",

      remarks:
        r.remarks || ""
    };
  });


  /*
   * Check duplicate Request IDs.
   */
  const requestIds = requestDocs.map(
    (r) => r.requestId
  );

  const uniqueRequestIds =
    new Set(requestIds);

  if (
    requestIds.length !==
    uniqueRequestIds.size
  ) {
    throw new Error(
      "Duplicate requestId found in maintenance_requests.json."
    );
  }


  const requests =
    await MaintenanceRequest.insertMany(
      requestDocs
    );

  console.log(
    `[Seed] Maintenance requests inserted: ${requests.length}`
  );

  return requests;
}


/**
 * Seed permanent maintenance history.
 */
async function seedMaintenanceHistory(
  userMap,
  assetMap,
  requestMap
) {
  console.log(
    "[Seed] Seeding maintenance history..."
  );

  if (
    !Array.isArray(historyData) ||
    historyData.length === 0
  ) {
    throw new Error(
      "maintenance_history.json is empty or invalid."
    );
  }

  const historyDocs = historyData.map((h) => {
    const assetObjectId =
      assetMap.get(h.assetId);

    const requestObjectId =
      requestMap.get(
        h.maintenanceRequestId
      );

    const technicianObjectId =
      userMap.get(h.technicianId);

    if (!assetObjectId) {
      throw new Error(
        `Asset ${h.assetId} referenced by history ${h.historyId} does not exist.`
      );
    }

    if (!requestObjectId) {
      throw new Error(
        `Request ${h.maintenanceRequestId} referenced by history ${h.historyId} does not exist.`
      );
    }

    if (!technicianObjectId) {
      throw new Error(
        `Technician ${h.technicianId} referenced by history ${h.historyId} does not exist.`
      );
    }

    return {
      historyId: h.historyId,

      assetId: assetObjectId,

      maintenanceRequestId:
        requestObjectId,

      technicianId:
        technicianObjectId,

      maintenanceDate:
        toDate(h.maintenanceDate) ||
        new Date(),

      previousStatus:
        h.previousStatus,

      issueDescription:
        h.issueDescription || "",

      diagnosis:
        h.diagnosis || "",

      maintenanceType:
        h.maintenanceType || "CORRECTIVE",

      workPerformed:
        h.workPerformed || "",

      partsReplaced:
        h.partsReplaced || "None",

      downtime:
        Number(h.downtime) || 0,

      maintenanceCost:
        Number(h.maintenanceCost) || 0,

      statusAfterMaintenance:
        h.statusAfterMaintenance,

      conditionAfterMaintenance:
        h.conditionAfterMaintenance,

      result:
        h.result || "RESOLVED",

      remarks:
        h.remarks || ""
    };
  });


  /*
   * Check duplicate History IDs.
   */
  const historyIds = historyDocs.map(
    (h) => h.historyId
  );

  const uniqueHistoryIds =
    new Set(historyIds);

  if (
    historyIds.length !==
    uniqueHistoryIds.size
  ) {
    throw new Error(
      "Duplicate historyId found in maintenance_history.json."
    );
  }


  const histories =
    await MaintenanceHistory.insertMany(
      historyDocs
    );

  console.log(
    `[Seed] Maintenance history inserted: ${histories.length}`
  );

  return histories;
}


/**
 * Seed notifications.
 */
async function seedNotifications(
  userMap,
  requestMap,
  assetMap
) {
  console.log("[Seed] Seeding notifications...");

  if (
    !Array.isArray(notificationsData)
  ) {
    throw new Error(
      "notifications.json is invalid."
    );
  }

  const notificationDocs =
    notificationsData
      .map((n) => {
        const recipient =
          userMap.get(n.recipient);

        if (!recipient) {
          console.warn(
            `[Seed] Skipping notification ${n.notificationId}: recipient ${n.recipient} not found.`
          );

          return null;
        }

        const relatedRequestId =
          n.relatedRequestId
            ? requestMap.get(
                n.relatedRequestId
              ) || null
            : null;

        const relatedAssetId =
          n.relatedAssetId
            ? assetMap.get(
                n.relatedAssetId
              ) || null
            : null;

        const notificationType =
          Object.values(
            NOTIFICATION_TYPE
          ).includes(n.type)
            ? n.type
            : NOTIFICATION_TYPE.SYSTEM_ALERT;

        return {
          notificationId:
            n.notificationId,

          recipient,

          type:
            notificationType,

          title:
            n.title || "Notification",

          message:
            n.message || "",

          relatedRequestId,

          relatedAssetId,

          isRead:
            Boolean(n.isRead),

          createdAt:
            toDate(n.createdAt) ||
            new Date()
        };
      })
      .filter(Boolean);


  if (notificationDocs.length === 0) {
    console.log(
      "[Seed] No valid notifications found."
    );

    return [];
  }


  const notifications =
    await Notification.insertMany(
      notificationDocs
    );

  console.log(
    `[Seed] Notifications inserted: ${notifications.length}`
  );

  return notifications;
}


/**
 * Update assets that currently have
 * active maintenance requests.
 */
async function updateActiveAssets(
  requests
) {
  console.log(
    "[Seed] Updating assets with active maintenance..."
  );

  const activeAssetIds =
    requests
      .filter((r) =>
        [
          MAINTENANCE_STATUS.PENDING,
          MAINTENANCE_STATUS.ASSIGNED,
          MAINTENANCE_STATUS.IN_PROGRESS
        ].includes(r.status)
      )
      .map((r) => r.assetId)
      .filter(Boolean);


  if (activeAssetIds.length === 0) {
    console.log(
      "[Seed] No active maintenance assets found."
    );

    return;
  }


  /*
   * Remove duplicate MongoDB ObjectIds.
   */
  const uniqueAssetIds = [
    ...new Set(
      activeAssetIds.map(
        (id) => id.toString()
      )
    )
  ];


  await Asset.updateMany(
    {
      _id: {
        $in: uniqueAssetIds
      }
    },
    {
      $set: {
        currentStatus:
          ASSET_STATUS.UNDER_MAINTENANCE
      }
    }
  );


  console.log(
    `[Seed] Updated ${uniqueAssetIds.length} assets to UNDER_MAINTENANCE.`
  );
}


/**
 * Update technician availability according
 * to active workload.
 */
async function updateTechnicianAvailability(
  requests
) {
  console.log(
    "[Seed] Updating technician availability..."
  );

  const activeTechnicianIds =
    requests
      .filter((r) =>
        [
          MAINTENANCE_STATUS.ASSIGNED,
          MAINTENANCE_STATUS.IN_PROGRESS
        ].includes(r.status)
      )
      .map((r) => r.assignedTechnician)
      .filter(Boolean);


  if (
    activeTechnicianIds.length === 0
  ) {
    return;
  }


  const uniqueTechnicianIds = [
    ...new Set(
      activeTechnicianIds.map(
        (id) => id.toString()
      )
    )
  ];


  await User.updateMany(
    {
      _id: {
        $in: uniqueTechnicianIds
      }
    },
    {
      $set: {
        availabilityStatus:
          AVAILABILITY_STATUS.BUSY
      }
    }
  );


  console.log(
    `[Seed] Updated ${uniqueTechnicianIds.length} technicians to BUSY.`
  );
}


/**
 * Main database seeding function.
 */
async function seedDatabase() {
  try {
    await connectDB();

    console.log(
      "===================================================="
    );

    console.log(
      " MEDASSET360 DATABASE SEED"
    );

    console.log(
      "===================================================="
    );

    console.log(
      "[Seed] Connected to MongoDB Atlas."
    );


    /*
     * IMPORTANT:
     *
     * This is a development seed.
     * Existing demo data in these collections
     * will be removed and recreated from JSON.
     */
    console.log(
      "[Seed] Clearing existing development data..."
    );


    await Promise.all([
      Notification.deleteMany({}),

      MaintenanceHistory.deleteMany({}),

      MaintenanceRequest.deleteMany({}),

      Asset.deleteMany({}),

      User.deleteMany({})
    ]);


    console.log(
      "[Seed] Existing development data cleared."
    );


    // ------------------------------------------------
    // 1. USERS
    // ------------------------------------------------

    const users =
      await seedUsers(false);


    const userMap =
      new Map(
        users.map(
          (u) => [
            u.userId,
            u._id
          ]
        )
      );


    // ------------------------------------------------
    // 2. ASSETS
    // ------------------------------------------------

    const assets =
      await seedAssets(false);


    const assetMap =
      new Map(
        assets.map(
          (a) => [
            a.assetId,
            a._id
          ]
        )
      );


    // ------------------------------------------------
    // 3. MAINTENANCE REQUESTS
    // ------------------------------------------------

    const requests =
      await seedMaintenanceRequests(
        userMap,
        assetMap
      );


    const requestMap =
      new Map(
        requests.map(
          (r) => [
            r.requestId,
            r._id
          ]
        )
      );


    // ------------------------------------------------
    // 4. MAINTENANCE HISTORY
    // ------------------------------------------------

    const histories =
      await seedMaintenanceHistory(
        userMap,
        assetMap,
        requestMap
      );


    // ------------------------------------------------
    // 5. UPDATE ACTIVE ASSETS
    // ------------------------------------------------

    await updateActiveAssets(
      requests
    );


    // ------------------------------------------------
    // 6. UPDATE TECHNICIAN AVAILABILITY
    // ------------------------------------------------

    await updateTechnicianAvailability(
      requests
    );


    // ------------------------------------------------
    // 7. NOTIFICATIONS
    // ------------------------------------------------

    const notifications =
      await seedNotifications(
        userMap,
        requestMap,
        assetMap
      );


    // ------------------------------------------------
    // FINAL RESULT
    // ------------------------------------------------

    console.log(
      "\n===================================================="
    );

    console.log(
      " DATABASE SEEDING COMPLETE"
    );

    console.log(
      "===================================================="
    );

    console.log(
      `Users:                 ${users.length}`
    );

    console.log(
      `Assets:                ${assets.length}`
    );

    console.log(
      `Maintenance Requests:  ${requests.length}`
    );

    console.log(
      `Maintenance History:   ${histories.length}`
    );

    console.log(
      `Notifications:         ${notifications.length}`
    );

    console.log(
      "----------------------------------------------------"
    );

    console.log(
      "Passwords were individually bcrypt-hashed."
    );

    console.log(
      "Plain-text passwords are NOT stored in MongoDB."
    );

    console.log(
      "===================================================="
    );


  } catch (error) {
    console.error(
      "\n[Seed] DATABASE SEEDING FAILED"
    );

    console.error(
      error.message
    );

    throw error;

  } finally {
    await mongoose.connection
      .close()
      .catch(() => {});
  }
}


/*
 * Run seedDatabase.js directly.
 */
seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });