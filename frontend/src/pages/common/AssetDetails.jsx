import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, MapPin, Package, ShieldCheck, Wrench, Edit3, DollarSign, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import AssetHistoryTimeline from '../../components/assets/AssetHistoryTimeline';
import Button from '../../components/common/Button';
import SectionCard from '../../components/common/SectionCard';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import { assetService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import pumpImage from '../../assets/images/infusion_pump.svg';

const fmt = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const AssetDetails = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [a, h] = await Promise.all([
        assetService.get(assetId),
        assetService.history(assetId).catch(() => []),
      ]);
      setAsset(a);
      setHistory(Array.isArray(h) ? h : []);
    } catch (e) {
      console.error('Failed to load asset details:', e);
      setError(e.response?.data?.message || `Unable to load details for asset "${assetId}" from MongoDB.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [assetId]);

  if (loading) return <LoadingBlock text={`Loading asset ${assetId} from MongoDB...`} />;
  if (error || !asset) {
    return (
      <div className="space-y-4">
        <Alert type="error">{error || 'Asset not found.'}</Alert>
        <Button variant="outline" onClick={() => navigate(-1)} icon={ArrowLeft}>
          Go Back
        </Button>
      </div>
    );
  }

  const rolePrefix = user?.role?.toLowerCase() || 'admin';
  const back = `/${rolePrefix}/assets`;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title={`${asset.assetId} • ${asset.assetName}`}
        description="Complete operational specifications, lifecycle schedule, and full maintenance history from MongoDB."
        icon={Package}
        breadcrumbs={[{ label: 'Assets', path: back }, { label: asset.assetId }]}
        action={
          <div className="flex items-center gap-2">
            {user?.role === 'ADMIN' && (
              <Button
                variant="primary"
                icon={Edit3}
                onClick={() => navigate(`/admin/assets/${asset.assetId}/edit`)}
              >
                Edit Asset
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(back)} icon={ArrowLeft}>
              Back to Assets
            </Button>
          </div>
        }
      />

      {/* Top Banner with Equipment Visual and Key Metrics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 border border-slate-100">
            <img
              src={pumpImage}
              alt={asset.assetName}
              className="h-44 w-44 object-contain drop-shadow-md transition transform hover:scale-105"
            />
            <span className="mt-3 font-mono text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {asset.assetId}
            </span>
          </div>

          <div className="lg:col-span-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</p>
              <div className="mt-2">
                <StatusBadge status={asset.currentStatus} />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Condition</p>
              <div className="mt-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    asset.currentCondition === 'EXCELLENT' || asset.currentCondition === 'GOOD'
                      ? 'bg-emerald-50 text-emerald-600'
                      : asset.currentCondition === 'FAIR'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {asset.currentCondition || 'GOOD'}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Criticality</p>
              <div className="mt-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    asset.criticality === 'CRITICAL' || asset.criticality === 'HIGH'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {asset.criticality || 'HIGH'}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
              <p className="mt-2 text-xs font-bold text-slate-800">
                {[asset.department, asset.ward, asset.room, asset.location].filter(Boolean).join(' • ') || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Maintenance */}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_.85fr]">
        <div className="space-y-6">
          {/* Asset Information Master Record */}
          <SectionCard title="Asset Master Specifications" subtitle="Master record stored in MongoDB">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Asset ID', asset.assetId],
                ['Asset Name', asset.assetName],
                ['Asset Type', asset.assetType || 'Medical Device'],
                ['Category', asset.category || 'Medical Equipment'],
                ['Manufacturer', asset.manufacturer],
                ['Model', asset.model],
                ['Serial Number', asset.serialNumber],
                ['Supplier', asset.supplier],
                ['Department', asset.department],
                ['Ward / Unit', asset.ward],
                ['Room', asset.room],
                ['Location Details', asset.location],
                ['Purchase Date', fmt(asset.purchaseDate)],
                ['Installation Date', fmt(asset.installationDate)],
                ['Purchase Cost', `₹${Number(asset.purchaseCost || 0).toLocaleString('en-IN')}`],
              ].map(([l, v]) => (
                <div key={l} className="border-b border-slate-50 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{l}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Maintenance Schedule & Warranty */}
          <SectionCard title="Maintenance Schedule & Warranty" subtitle="Preventive maintenance and warranty tracking">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info icon={CalendarDays} label="Last Maintenance" value={fmt(asset.lastMaintenanceDate)} />
              <Info icon={CalendarDays} label="Next Scheduled" value={fmt(asset.nextMaintenanceDate)} />
              <Info label="Frequency" value={asset.maintenanceFrequency || 'QUARTERLY'} />
              <Info label="Warranty Expiry" value={fmt(asset.warrantyEndDate)} />
            </div>
          </SectionCard>

          {/* Permanent Timeline */}
          <AssetHistoryTimeline history={history} />
        </div>

        {/* Right Side Column */}
        <div className="space-y-6">
          {/* Active Maintenance Ticket */}
          <SectionCard
            title="Active Maintenance Ticket"
            subtitle="Current active ticket associated with this asset"
          >
            {asset.activeRequest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-blue-600">
                    {asset.activeRequest.requestId}
                  </span>
                  <StatusBadge status={asset.activeRequest.status} />
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {asset.activeRequest.issueDescription}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <Info label="Priority" value={asset.activeRequest.priority} />
                  <Info label="Reported On" value={fmt(asset.activeRequest.reportedAt || asset.activeRequest.createdAt)} />
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate(`/${rolePrefix}/maintenance/${asset.activeRequest.requestId}`)}
                >
                  Open Ticket Workflow
                </Button>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>No active maintenance request. Equipment is available.</span>
              </div>
            )}
          </SectionCard>

          {/* Maintenance Stats Aggregation */}
          <SectionCard title="Maintenance Snapshot" subtitle="Aggregated metrics from MongoDB history">
            <div className="space-y-3">
              {[
                ['Total Completed Services', `${asset.maintenanceStats?.totalMaintenanceCount || history.length || 0} times`],
                ['Total Equipment Downtime', `${asset.maintenanceStats?.totalDowntime || 0} hours`],
                ['Cumulative Maintenance Cost', `₹${Number(asset.maintenanceStats?.totalCost || 0).toLocaleString('en-IN')}`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{l}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{v}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {asset.description && (
            <SectionCard title="Asset Description">
              <p className="text-xs leading-6 text-slate-600">{asset.description}</p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="min-w-0">
    {Icon && <Icon size={14} className="mb-1.5 text-blue-500" />}
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <div className="mt-1 text-xs font-semibold text-slate-800">{value || '—'}</div>
  </div>
);

export default AssetDetails;
