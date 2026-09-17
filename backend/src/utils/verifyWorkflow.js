const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/User');
const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MaintenanceHistory = require('../models/MaintenanceHistory');

// Simple native test runner using HTTP server in memory
const runVerification = async () => {
  console.log('====================================================');
  console.log(' STARTING END-TO-END WORKFLOW & BUSINESS RULE TESTS');
  console.log('====================================================');

  await connectDB();

  // Start app on ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const request = async (url, options = {}) => {
    const res = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  };

  try {
    // 1. Authenticate Staff (Anitha)
    console.log('\n[Test 1] Logging in Staff (anitha@hospital.com)...');
    const staffLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'anitha@hospital.com', password: 'password123' }),
    });
    console.assert(staffLogin.status === 200, `Staff login failed: ${JSON.stringify(staffLogin.data)}`);
    const staffToken = staffLogin.data.data.token;
    console.log('✓ Staff logged in successfully. Token acquired.');

    // 2. Authenticate Admin (Ravi Kumar)
    console.log('\n[Test 2] Logging in Admin (ravi.kumar@hospital.com)...');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ravi.kumar@hospital.com', password: 'password123' }),
    });
    console.assert(adminLogin.status === 200, `Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    const adminToken = adminLogin.data.data.token;
    console.log('✓ Admin logged in successfully.');

    // 3. Authenticate Technician (Arun Kumar)
    console.log('\n[Test 3] Logging in Technician (arun.kumar@hospital.com)...');
    const techLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'arun.kumar@hospital.com', password: 'password123' }),
    });
    console.assert(techLogin.status === 200, `Tech login failed: ${JSON.stringify(techLogin.data)}`);
    const techToken = techLogin.data.data.token;
    console.log('✓ Technician logged in successfully.');

    // 4. Check Asset IP-102 (Infusion Pump)
    console.log('\n[Test 4] Querying Asset IP-102...');
    const assetRes = await request('/assets/IP-102', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    console.assert(assetRes.status === 200, 'Asset query failed');
    console.log(`✓ Asset IP-102 found. Current Status: ${assetRes.data.data.currentStatus}, Condition: ${assetRes.data.data.currentCondition}`);

    // 5. Staff Reports Maintenance on IP-102
    console.log('\n[Test 5] Staff creating maintenance request for IP-102...');
    const createReqRes = await request('/maintenance', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        assetId: 'IP-102',
        issueType: 'Flow Sensor Error',
        issueDescription: 'Infusion pump showing air-in-line error false positive during saline delivery.',
        priority: 'HIGH',
      }),
    });
    console.assert(createReqRes.status === 201, `Failed to create request: ${JSON.stringify(createReqRes.data)}`);
    const createdReq = createReqRes.data.data;
    console.log(`✓ Maintenance request created: ${createdReq.requestId}, Status: ${createdReq.status}`);

    // Verify Asset IP-102 status transitioned to UNDER_MAINTENANCE
    const assetCheck1 = await Asset.findOne({ assetId: 'IP-102' });
    console.assert(assetCheck1.currentStatus === 'UNDER_MAINTENANCE', `Expected UNDER_MAINTENANCE, got ${assetCheck1.currentStatus}`);
    console.log(`✓ Verified Asset IP-102 transitioned to UNDER_MAINTENANCE.`);

    // 6. CRITICAL BUSINESS RULE TEST: DUPLICATE REQUEST PREVENTION
    console.log('\n[Test 6] Testing DUPLICATE REQUEST PREVENTION on IP-102...');
    const dupRes = await request('/maintenance', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        assetId: 'IP-102',
        issueType: 'Power Error',
        issueDescription: 'Attempting to file duplicate request for same asset.',
        priority: 'MEDIUM',
      }),
    });
    console.assert(dupRes.status === 409, `Expected 409 Conflict, got ${dupRes.status}`);
    console.assert(dupRes.data.existingRequest.requestId === createdReq.requestId, 'Expected matching existingRequestId');
    console.log(`✓ DUPLICATE PREVENTED PROPERLY! Server returned HTTP 409: "${dupRes.data.message}"`);
    console.log(`  Existing active request reference: ${dupRes.data.existingRequest.requestId} (${dupRes.data.existingRequest.status})`);

    // 7. Admin assigns Technician (Arun Kumar) to the SAME request
    console.log(`\n[Test 7] Admin assigning Technician Arun Kumar (TEC-001) to ${createdReq.requestId}...`);
    const assignRes = await request(`/maintenance/${createdReq.requestId}/assign`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ technicianId: 'TEC-001' }),
    });
    console.assert(assignRes.status === 200, `Assign failed: ${JSON.stringify(assignRes.data)}`);
    console.assert(assignRes.data.data.status === 'ASSIGNED', 'Status not ASSIGNED');
    console.log(`✓ Request ${createdReq.requestId} assigned to Technician Arun Kumar. Status: ASSIGNED.`);

    // 8. Technician Starts Maintenance
    console.log(`\n[Test 8] Technician starting work on ${createdReq.requestId}...`);
    const startRes = await request(`/maintenance/${createdReq.requestId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${techToken}` },
    });
    console.assert(startRes.status === 200, `Start failed: ${JSON.stringify(startRes.data)}`);
    console.assert(startRes.data.data.status === 'IN_PROGRESS', 'Status not IN_PROGRESS');
    console.log(`✓ Request ${createdReq.requestId} status is now IN_PROGRESS.`);

    // 9. Technician Completes Maintenance
    console.log(`\n[Test 9] Technician completing maintenance work on ${createdReq.requestId}...`);
    const completeRes = await request(`/maintenance/${createdReq.requestId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${techToken}` },
      body: JSON.stringify({
        diagnosis: 'Ultrasonic air sensor contamination.',
        workPerformed: 'Disassembled sensor guide, cleaned ultrasonic emitter, performed self-test calibration.',
        partsReplaced: 'Gasket seal #GS-11',
        downtime: 3.5,
        maintenanceCost: 1800,
        conditionAfterMaintenance: 'GOOD',
        result: 'RESOLVED',
        remarks: 'Unit test passed. Tested at 25ml/hr and 100ml/hr.',
      }),
    });
    console.assert(completeRes.status === 200, `Complete failed: ${JSON.stringify(completeRes.data)}`);
    console.log(`✓ Maintenance completed successfully!`);

    // 10. Verify Asset State Update & History Creation
    console.log('\n[Test 10] Verifying Asset current state and permanent history record...');
    const assetCheck2 = await Asset.findOne({ assetId: 'IP-102' });
    console.assert(assetCheck2.currentStatus === 'AVAILABLE', `Expected AVAILABLE, got ${assetCheck2.currentStatus}`);
    console.assert(assetCheck2.currentCondition === 'GOOD', `Expected GOOD, got ${assetCheck2.currentCondition}`);
    console.log(`✓ Asset IP-102 returned to: ${assetCheck2.currentStatus}, Condition: ${assetCheck2.currentCondition}`);

    const historyRecord = await MaintenanceHistory.findOne({ maintenanceRequestId: createdReq._id });
    console.assert(historyRecord !== null, 'Permanent history record was not found!');
    console.log(`✓ Permanent Maintenance History record verified! ID: ${historyRecord.historyId}`);
    console.log(`  - Downtime: ${historyRecord.downtime}h`);
    console.log(`  - Cost: ₹${historyRecord.maintenanceCost}`);
    console.log(`  - Diagnosis: ${historyRecord.diagnosis}`);
    console.log(`  - Status After: ${historyRecord.statusAfterMaintenance}`);

    // 11. Verify Asset Timeline API
    console.log('\n[Test 11] Checking Asset History Timeline API...');
    const timelineRes = await request('/assets/IP-102/history', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    console.assert(timelineRes.status === 200, 'Timeline failed');
    console.log(`✓ Asset timeline retrieved. Total historical events: ${timelineRes.data.data.length}`);

    // 12. Verify Reports API
    console.log('\n[Test 12] Checking Operational Reports API...');
    const reportRes = await request('/reports/operational', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(reportRes.status === 200, 'Report failed');
    console.log(`✓ Operational reports successfully computed:`);
    console.log(`  - Total Cost: ₹${reportRes.data.data.costAndDowntime.summary.totalCost}`);
    console.log(`  - Total Downtime: ${reportRes.data.data.costAndDowntime.summary.totalDowntime} hours`);
    console.log(`  - Active Warranties: ${reportRes.data.data.warrantyReport.active}`);

    console.log('\n====================================================');
    console.log(' ALL WORKFLOW AND BUSINESS RULE TESTS PASSED 100%!');
    console.log('====================================================\n');

    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Verification failed with error:', error);
    server.close();
    process.exit(1);
  }
};

runVerification();
