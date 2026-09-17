MedAsset360 Seed Data
=====================
Source: uploaded hospital_asset_management_dataset ZIP.

Files:
- users.json (25 users; password field is plaintext seed input and must be hashed by seedUsers.js before MongoDB insertion)
- assets.json (100 assets)
- maintenance_requests.json (120 requests)
- maintenance_history.json (90 history records)
- notifications.json (63 notifications)
- user_credentials.csv (demo reference credentials)

The JSON files were cleaned for Node.js compatibility (CSV NaN values were converted to null).
Asset records include currentRemarks: null to match the current backend model.

Relationships validated:
- all request assetIds exist in assets
- all reportedBy/assignedBy/assignedTechnician IDs exist in users
- all history assetIds/request IDs/technician IDs exist
- all notification recipient/request/asset references exist
- no duplicate userId, assetId, requestId, historyId, or notificationId
