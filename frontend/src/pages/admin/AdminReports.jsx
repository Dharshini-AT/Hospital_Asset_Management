import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart3,
  CircleDollarSign,
  Clock3,
  ShieldAlert,
  Wrench,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Building2,
  Users,
  Activity,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import StatusBadge from '../../components/common/StatusBadge';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import { reportService } from '../../services/dataService';

const AdminReports = () => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    reportService
      .operational()
      .then(setD)
      .catch((e) => setError(e.response?.data?.message || 'Unable to load operational reports.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock text="Generating operational reports from database..." />;
  if (error) return <Alert type="error">{error}</Alert>;

  const dist = d?.assetDistribution || {};
  const max = (arr, key = 'count') => Math.max(1, ...(arr || []).map((x) => x[key] || 0));

  const totalWarranties =
    (d?.warrantyReport?.active || 0) +
    (d?.warrantyReport?.expiringSoon || 0) +
    (d?.warrantyReport?.expired || 0);

  const activePct = totalWarranties ? ((d?.warrantyReport?.active || 0) / totalWarranties) * 100 : 0;
  const expiringPct = totalWarranties ? ((d?.warrantyReport?.expiringSoon || 0) / totalWarranties) * 100 : 0;
  const expiredPct = totalWarranties ? ((d?.warrantyReport?.expired || 0) / totalWarranties) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Operational Reports & Analytics"
        description="Live equipment metrics, maintenance costs, warranty exposure, failure patterns, and technician workloads."
        icon={BarChart3}
      />

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={CircleDollarSign}
          title="Total Maintenance Cost"
          value={`₹${Number(d?.costAndDowntime?.summary?.totalCost || 0).toLocaleString('en-IN')}`}
          subtitle={`${d?.costAndDowntime?.summary?.totalEvents || 0} service events recorded`}
          iconStyle="emerald"
        />
        <Metric
          icon={Clock3}
          title="Total Downtime"
          value={`${d?.costAndDowntime?.summary?.totalDowntime || 0} hrs`}
          subtitle="Cumulative repair & service hours"
          iconStyle="blue"
        />
        <Metric
          icon={ShieldAlert}
          title="Expiring Warranties"
          value={d?.warrantyReport?.expiringSoon || 0}
          subtitle="Assets expiring in next 30 days"
          iconStyle="amber"
        />
        <Metric
          icon={Activity}
          title="Active Warranties"
          value={d?.warrantyReport?.active || 0}
          subtitle={`${totalWarranties} total registered equipment`}
          iconStyle="violet"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart title="Assets by Category / Type" data={dist.byType} max={max(dist.byType)} color="bg-blue-500" />
        <Chart title="Assets by Hospital Department" data={dist.byDepartment} max={max(dist.byDepartment)} color="bg-indigo-500" />
        <Chart title="Equipment Current Status" data={dist.byStatus} max={max(dist.byStatus)} color="bg-emerald-500" />
        <Chart title="Maintenance by Service Type" data={d?.maintenanceBreakdown?.byType} max={max(d?.maintenanceBreakdown?.byType)} color="bg-violet-500" />
      </div>

      {/* Warranty Exposure & Frequently Repaired Equipment */}
      <div className="grid gap-5 lg:grid-cols-2 items-start">
        {/* Warranty Exposure Card */}
        <SectionCard
          title="Warranty Exposure & Status"
          subtitle="Current warranty coverage across registered hospital assets"
        >
          <div className="space-y-5">
            {/* Metric Pills */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-100/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{d?.warrantyReport?.active || 0}</p>
                <p className="text-[10px] text-emerald-600/80 mt-0.5">{activePct.toFixed(0)}% of assets</p>
              </div>
              <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-100/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Expiring Soon</p>
                <p className="mt-1 text-2xl font-black text-amber-700">{d?.warrantyReport?.expiringSoon || 0}</p>
                <p className="text-[10px] text-amber-600/80 mt-0.5">{expiringPct.toFixed(0)}% of assets</p>
              </div>
              <div className="rounded-xl bg-rose-50/70 p-3.5 border border-rose-100/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Expired</p>
                <p className="mt-1 text-2xl font-black text-rose-700">{d?.warrantyReport?.expired || 0}</p>
                <p className="text-[10px] text-rose-600/80 mt-0.5">{expiredPct.toFixed(0)}% of assets</p>
              </div>
            </div>

            {/* Proportional Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                <span>Warranty Coverage Breakdown</span>
                <span>{totalWarranties} Total Units</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${activePct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Active: ${activePct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${expiringPct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`Expiring Soon: ${expiringPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${expiredPct}%` }}
                  className="bg-rose-400 transition-all duration-500"
                  title={`Expired: ${expiredPct.toFixed(1)}%`}
                />
              </div>
            </div>

            {/* Expiring Soon Details List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-500" />
                  Upcoming Expirations (Next 30 Days)
                </p>
                <button
                  onClick={() => navigate('/admin/assets')}
                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All Assets
                </button>
              </div>

              {(d?.warrantyReport?.expiringAssets || []).length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No assets currently expiring in the next 30 days.
                </div>
              ) : (
                <div className="space-y-2">
                  {(d?.warrantyReport?.expiringAssets || []).map((item) => (
                    <div
                      key={item._id || item.assetId}
                      onClick={() => navigate(`/admin/assets/${item.assetId}`)}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-blue-50/40 transition cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-blue-600">{item.assetId}</span>
                          <span className="text-xs font-bold text-slate-800 truncate">{item.assetName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.department} • Model: {item.model || 'Standard'}
                        </p>
                      </div>
                      <div className="text-right pl-3 shrink-0">
                        <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-200/60">
                          {new Date(item.warrantyEndDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Frequently Repaired Equipment */}
        <SectionCard
          title="Frequently Repaired Equipment"
          subtitle="Repeated maintenance events indicate assets requiring preventative overhauls"
        >
          <div className="space-y-3">
            {(d?.assetReliability?.frequentlyRepaired || []).length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-xs text-slate-400">
                No repeated maintenance events logged yet.
              </div>
            ) : (
              (d?.assetReliability?.frequentlyRepaired || []).map((x) => (
                <div
                  key={x.assetId}
                  onClick={() => navigate(`/admin/assets/${x.assetId}`)}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 hover:bg-blue-50/40 hover:border-blue-200 transition cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                    <Wrench size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-slate-800">{x.assetName}</p>
                      <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-100">
                        {x.failureCount} repairs
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <p className="font-mono font-medium text-blue-600">{x.assetId} • {x.department}</p>
                      <p className="font-semibold text-slate-600">₹{Number(x.totalCost || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Department Maintenance Cost & Technician Performance */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Cost by Department */}
        <SectionCard
          title="Maintenance Cost by Department"
          subtitle="Expenditure distribution across hospital departments"
        >
          <div className="space-y-3">
            {(d?.costAndDowntime?.byDepartment || []).slice(0, 6).map((dept) => {
              const maxCost = Math.max(1, ...(d?.costAndDowntime?.byDepartment || []).map((x) => x.totalCost || 0));
              const pct = ((dept.totalCost || 0) / maxCost) * 100;
              return (
                <div key={dept._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{dept._id || 'General'}</span>
                    <span className="font-bold text-blue-600">₹{Number(dept.totalCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{dept.count} service jobs</span>
                    <span>{dept.totalDowntime} hrs downtime</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Technician Workload Performance */}
        <SectionCard
          title="Technician Workload Performance"
          subtitle="Real-time ticket handling and task completions by technician"
        >
          <div className="space-y-3">
            {(d?.technicianWorkload || []).slice(0, 6).map((t) => (
              <div
                key={t.technician?._id || t.technician?.userId}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                    {t.technician?.name?.slice(0, 2).toUpperCase() || 'TC'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{t.technician?.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{t.technician?.userId} • {t.technician?.specialization || 'Biomedical'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div className="text-[10px]">
                    <span className="font-bold text-blue-600">{t.totalWorkload || 0} active</span>
                    <span className="text-slate-400 block">{t.completed || 0} completed</span>
                  </div>
                  <StatusBadge status={t.technician?.availabilityStatus || 'AVAILABLE'} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, title, value, subtitle, iconStyle = 'blue' }) => {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${styles[iconStyle] || styles.blue}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-2xl font-bold text-[#09284d]">{value}</p>
      {subtitle && <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>}
    </div>
  );
};

const Chart = ({ title, data = [], max: mx, color = 'bg-blue-500' }) => (
  <SectionCard title={title} subtitle="Distribution across current hospital dataset">
    <div className="space-y-3">
      {data.slice(0, 7).map((x, i) => (
        <div key={`${x._id}-${i}`}>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="font-semibold text-slate-700">{x._id || 'Unassigned'}</span>
            <span className="font-bold text-slate-800">{x.count || 0} units</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${color} transition-all duration-500`}
              style={{ width: `${((x.count || 0) / mx) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
);

export default AdminReports;
