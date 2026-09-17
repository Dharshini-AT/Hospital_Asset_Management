import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Box, Check, Users, Wrench, AlertCircle } from 'lucide-react';
import { dashboardService, reportService, userService, assetService } from '../../services/dataService';
import { LoadingBlock, Alert } from '../../components/common/Feedback';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [techList, setTechList] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashData, repData, techs, assetsRes] = await Promise.all([
        dashboardService.admin(),
        reportService.operational().catch(() => null),
        userService.technicians().catch(() => []),
        assetService.list({ limit: 100 }).catch(() => ({ assets: [] })),
      ]);

      setData(dashData);
      setReportData(repData);
      setTechList(techs || []);

      // Calculate upcoming maintenance from actual database assets
      const allAssets = assetsRes?.assets || [];
      const scheduled = allAssets
        .filter((a) => a.nextMaintenanceDate || a.lastMaintenanceDate || a.currentStatus === 'UNDER_MAINTENANCE')
        .slice(0, 5)
        .map((a) => {
          const dateVal = a.nextMaintenanceDate || a.lastMaintenanceDate || a.updatedAt;
          return {
            assetId: a.assetId,
            assetName: a.assetName,
            date: dateVal ? new Date(dateVal).toISOString().split('T')[0] : '—',
            type: a.maintenanceType || 'PREVENTIVE',
            status: a.currentStatus === 'UNDER_MAINTENANCE' ? 'Pending' : 'Scheduled',
          };
        });

      setUpcomingList(scheduled);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Compute live asset status breakdown strictly from database reports or stats
  const assetStatusStats = useMemo(() => {
    const byStatus = reportData?.assetDistribution?.byStatus || [];
    const statusMap = {
      AVAILABLE: 0,
      UNDER_MAINTENANCE: 0,
      OUT_OF_SERVICE: 0,
      RETIRED: 0,
    };

    byStatus.forEach((item) => {
      if (item._id && statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    const total = data?.stats?.totalAssets || (statusMap.AVAILABLE + statusMap.UNDER_MAINTENANCE + statusMap.OUT_OF_SERVICE + statusMap.RETIRED) || 0;

    return {
      total,
      available: statusMap.AVAILABLE,
      underMaintenance: statusMap.UNDER_MAINTENANCE || (data?.stats?.underMaintenance ?? 0),
      outOfService: statusMap.OUT_OF_SERVICE,
      retired: statusMap.RETIRED,
      availablePct: total > 0 ? ((statusMap.AVAILABLE / total) * 100).toFixed(1) : '0.0',
      underMaintPct: total > 0 ? (((statusMap.UNDER_MAINTENANCE || data?.stats?.underMaintenance || 0) / total) * 100).toFixed(1) : '0.0',
      outOfServicePct: total > 0 ? ((statusMap.OUT_OF_SERVICE / total) * 100).toFixed(1) : '0.0',
      retiredPct: total > 0 ? ((statusMap.RETIRED / total) * 100).toFixed(1) : '0.0',
    };
  }, [reportData, data]);

  // Compute live technician breakdown strictly from database user records
  const technicianStats = useMemo(() => {
    const total = techList.length;
    const available = techList.filter((t) => t.availabilityStatus === 'AVAILABLE').length;
    const busy = techList.filter((t) => t.availabilityStatus === 'BUSY').length;
    const offline = techList.filter((t) => t.availabilityStatus === 'OFFLINE' || !t.availabilityStatus).length;

    return {
      total,
      available,
      busy,
      offline,
    };
  }, [techList]);

  if (loading) {
    return <LoadingBlock text="Loading live dashboard from MongoDB..." />;
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  const stats = data?.stats || {};
  const recentRequests = data?.recentRequests || [];

  // Circumference for Donut SVG calculation: C = 2 * PI * r = 2 * 3.14159 * 38 = ~238.76
  const CIRCUMFERENCE = 238.76;
  const availDash = (Number(assetStatusStats.availablePct) / 100) * CIRCUMFERENCE;
  const underDash = (Number(assetStatusStats.underMaintPct) / 100) * CIRCUMFERENCE;
  const outDash = (Number(assetStatusStats.outOfServicePct) / 100) * CIRCUMFERENCE;
  const retDash = (Number(assetStatusStats.retiredPct) / 100) * CIRCUMFERENCE;

  const techTotal = technicianStats.total || 1;
  const techAvailDash = (technicianStats.available / techTotal) * CIRCUMFERENCE;
  const techBusyDash = (technicianStats.busy / techTotal) * CIRCUMFERENCE;
  const techOffDash = (technicianStats.offline / techTotal) * CIRCUMFERENCE;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0a192f]">
          Dashboard
        </h1>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Assets */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00a8cc]/15 text-[#00a8cc]">
            <Box size={26} className="stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Assets</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">
              {stats.totalAssets ?? 0}
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-[#f59e0b]">
            <Wrench size={26} className="stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Requests</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">
              {stats.pendingRequests ?? 0}
            </p>
          </div>
        </div>

        {/* In Progress */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c3aed]/15 text-[#7c3aed]">
            <Users size={26} className="stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">In Progress</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">
              {stats.inProgressRequests ?? 0}
            </p>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10b981]/15 text-[#10b981]">
            <Check size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Completed</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">
              {stats.completedRequests ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Donut Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Asset Status Overview */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0a192f] mb-6">
            Asset Status Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
            {/* Donut Chart SVG */}
            <div className="sm:col-span-5 flex justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Cyan arc: Available */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#00a8cc"
                    strokeWidth="10"
                    strokeDasharray={`${availDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset="0"
                  />
                  {/* Orange arc: Under Maintenance */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray={`${underDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`-${availDash}`}
                  />
                  {/* Red arc: Out of Service */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeDasharray={`${outDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`-${availDash + underDash}`}
                  />
                  {/* Purple arc: Retired / Decommissioned */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="10"
                    strokeDasharray={`${retDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`-${availDash + underDash + outDash}`}
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-800 leading-none">
                    {assetStatusStats.total}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1">
                    Total Assets
                  </span>
                </div>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="sm:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00a8cc]" />
                  <span className="text-slate-600">Available</span>
                </div>
                <span className="font-bold text-slate-800">
                  {assetStatusStats.available} ({assetStatusStats.availablePct}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-slate-600">Under Maintenance</span>
                </div>
                <span className="font-bold text-slate-800">
                  {assetStatusStats.underMaintenance} ({assetStatusStats.underMaintPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                  <span className="text-slate-600">Out of Service</span>
                </div>
                <span className="font-bold text-slate-800">
                  {assetStatusStats.outOfService} ({assetStatusStats.outOfServicePct}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                  <span className="text-slate-600">Decommissioned / Retired</span>
                </div>
                <span className="font-bold text-slate-800">
                  {assetStatusStats.retired} ({assetStatusStats.retiredPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Availability */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0a192f] mb-6">
            Technician Availability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
            {/* Donut Chart SVG */}
            <div className="sm:col-span-5 flex justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Green arc: Available */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${techAvailDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset="0"
                  />
                  {/* Orange arc: Busy */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray={`${techBusyDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`-${techAvailDash}`}
                  />
                  {/* Red arc: Offline */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeDasharray={`${techOffDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`-${techAvailDash + techBusyDash}`}
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-800 leading-none">
                    {technicianStats.total}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1">
                    Total Technicians
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="sm:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-slate-600">Available</span>
                </div>
                <span className="font-bold text-slate-800">{technicianStats.available}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-slate-600">Busy</span>
                </div>
                <span className="font-bold text-slate-800">{technicianStats.busy}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                  <span className="text-slate-600">On Leave / Offline</span>
                </div>
                <span className="font-bold text-slate-800">{technicianStats.offline}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Maintenance & Recent Requests Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Maintenance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0a192f]">
              Upcoming Maintenance
            </h2>
            <button
              onClick={() => navigate('/admin/assets')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              View Assets
            </button>
          </div>

          <div className="overflow-x-auto">
            {upcomingList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No maintenance tasks scheduled.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold">
                    <th className="py-3 px-3">Asset ID</th>
                    <th className="py-3 px-3">Asset Name</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcomingList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {item.assetId}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        {item.assetName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {item.type}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.status === 'Scheduled'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Maintenance Requests */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0a192f]">
              Recent Maintenance Requests
            </h2>
            <button
              onClick={() => navigate('/admin/maintenance')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent maintenance requests.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Asset</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.slice(0, 5).map((req) => (
                    <tr
                      key={req._id || req.requestId}
                      onClick={() => navigate(`/admin/maintenance/${req.requestId}`)}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {req.requestId}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        {req.assetId?.assetName || req.assetId?.assetId || '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            req.priority === 'HIGH' || req.priority === 'CRITICAL'
                              ? 'bg-red-50 text-red-600'
                              : req.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {req.priority ? req.priority.charAt(0) + req.priority.slice(1).toLowerCase() : 'Medium'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            req.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-600'
                              : req.status === 'ASSIGNED'
                              ? 'bg-blue-50 text-blue-600'
                              : req.status === 'IN_PROGRESS'
                              ? 'bg-cyan-50 text-cyan-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {req.status === 'IN_PROGRESS' ? 'In Progress' : req.status ? req.status.charAt(0) + req.status.slice(1).toLowerCase() : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
