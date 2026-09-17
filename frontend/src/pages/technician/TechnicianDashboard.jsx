import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import SectionCard from '../../components/common/SectionCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Button from '../../components/common/Button';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import { dashboardService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const TechnicianDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'COMPLETED'
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.technician();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load technician workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <LoadingBlock text="Loading technician workspace..." />;
  if (error) return <Alert type="error">{error}</Alert>;

  const stats = data?.stats || {};
  const recentRequests = data?.recentRequests || [];

  const openTickets = recentRequests.filter(
    (r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  );
  const completedTickets = recentRequests.filter((r) => r.status === 'COMPLETED');

  const displayedTickets = activeTab === 'ACTIVE' ? openTickets : completedTickets;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Technician Workspace"
        description="Assigned maintenance work orders, diagnostic checklists, and equipment service records."
        icon={Wrench}
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                user?.availabilityStatus === 'AVAILABLE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : user?.availabilityStatus === 'BUSY'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  user?.availabilityStatus === 'AVAILABLE'
                    ? 'bg-emerald-500 animate-pulse'
                    : user?.availabilityStatus === 'BUSY'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              {user?.availabilityStatus || 'AVAILABLE'}
            </span>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          onClick={() => {
            setActiveTab('ACTIVE');
          }}
          className="cursor-pointer"
        >
          <StatCard
            title="Assigned to You"
            value={stats.assignedRequests || 0}
            icon={ClipboardList}
            description="Waiting to be started"
            iconStyle="blue"
          />
        </div>

        <div
          onClick={() => {
            setActiveTab('ACTIVE');
          }}
          className="cursor-pointer"
        >
          <StatCard
            title="In Progress"
            value={stats.inProgress || 0}
            icon={Activity}
            description="Active service jobs"
            iconStyle="violet"
          />
        </div>

        <div
          onClick={() => {
            setActiveTab('COMPLETED');
          }}
          className="cursor-pointer"
        >
          <StatCard
            title="Completed Jobs"
            value={stats.completed || 0}
            icon={CheckCircle2}
            description="Finished service records"
            iconStyle="emerald"
          />
        </div>

        <div onClick={() => navigate('/technician/profile')} className="cursor-pointer">
          <StatCard
            title="Current Status"
            value={stats.availabilityStatus || user?.availabilityStatus || 'AVAILABLE'}
            icon={Clock3}
            description="Click to manage profile"
            iconStyle={user?.availabilityStatus === 'BUSY' ? 'orange' : 'emerald'}
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr] items-start">
        {/* Left Card: Work Queue & History Switcher */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          {/* Header with Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0a192f]">Maintenance Work Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'ACTIVE'
                  ? `Showing open jobs awaiting your action (${openTickets.length})`
                  : `Showing recently resolved equipment service records (${completedTickets.length})`}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ACTIVE'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity size={13} />
                <span>Active Queue ({openTickets.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'COMPLETED'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Completed ({stats.completed || completedTickets.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Content List */}
          <div className="mt-5 space-y-4">
            {displayedTickets.length === 0 ? (
              activeTab === 'ACTIVE' ? (
                /* Empty state for Active Queue */
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">All Caught Up — No Pending Assignments</h3>
                  <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    You have 0 pending maintenance requests in your active queue. All {stats.completed || 0} assigned jobs have been resolved and logged in the database.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => setActiveTab('COMPLETED')}
                    >
                      View Completed Work ({stats.completed || 0})
                    </Button>
                    <Button
                      size="sm"
                      icon={Wrench}
                      onClick={() => navigate('/technician/requests')}
                    >
                      All Assigned Requests
                    </Button>
                  </div>
                </div>
              ) : (
                /* Empty state for Completed */
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-500">
                  No completed maintenance records found in your profile history yet.
                </div>
              )
            ) : (
              displayedTickets.map((r) => (
                <div
                  key={r.requestId || r._id}
                  onClick={() => navigate(`/technician/requests/${r.requestId || r._id}`)}
                  className="rounded-xl border border-slate-200 bg-white p-4.5 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{r.requestId}</span>
                        <span className="text-xs font-bold text-[#09284d] truncate">
                          {r.assetId?.assetName || 'Medical Equipment'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Asset ID: <b className="text-slate-600 font-mono">{r.assetId?.assetId || '—'}</b> • Location:{' '}
                        <b className="text-slate-600">{r.assetId?.location || 'General Ward'}</b>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={r.priority} />
                      <StatusBadge status={r.status} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Issue: </span>
                    {r.issueDescription}
                  </p>

                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <div>
                      {r.status === 'COMPLETED' ? (
                        <span>
                          Resolved on: <b className="text-slate-700">{new Date(r.completedAt || r.updatedAt).toLocaleDateString('en-IN')}</b>
                        </span>
                      ) : (
                        <span>
                          Reported by: <b className="text-slate-700">{r.reportedBy?.name || 'Staff Member'}</b> ({r.reportedBy?.department || 'Ward'})
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform text-xs">
                      {r.status === 'ASSIGNED'
                        ? 'Start Maintenance →'
                        : r.status === 'IN_PROGRESS'
                        ? 'Complete Service →'
                        : 'View Service Details →'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: SOP Checklist & Quick Context */}
        <div className="space-y-5">
          {/* Technician Quick Profile Card */}
          <SectionCard title="Technician Profile" subtitle="Assigned service department">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm border border-blue-100">
                  {user?.name?.slice(0, 2).toUpperCase() || 'TC'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] font-mono text-blue-600">{user?.userId}</p>
                  <p className="text-[10px] text-slate-400">{user?.specialization || 'Biomedical Equipment'}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Serviced:</span>
                  <span className="font-bold text-slate-800">{stats.completed || 0} assets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Workload:</span>
                  <span className="font-bold text-blue-600">{(stats.assignedRequests || 0) + (stats.inProgress || 0)} jobs</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/technician/assets')}
                icon={ExternalLink}
              >
                Browse Hospital Assets
              </Button>
            </div>
          </SectionCard>

          {/* Service Checklist (SOP) */}
          <SectionCard
            title="Service Protocol"
            subtitle="Standard checklist for equipment maintenance"
          >
            <div className="space-y-2.5">
              {[
                'Inspect asset and confirm reported symptom',
                'Isolate power source & follow safety protocol',
                'Perform diagnostics and replace faulty parts',
                'Calibrate equipment to standard tolerances',
                'Log downtime, replacement parts, and cost',
                'Set condition & complete record in database',
              ].map((step, idx) => (
                <div
                  key={step}
                  className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100/60"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold text-blue-600 shadow-xs border border-slate-200">
                    {idx + 1}
                  </span>
                  <p className="text-[11px] font-medium leading-4 text-slate-600 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
