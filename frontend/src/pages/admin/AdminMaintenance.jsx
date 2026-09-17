import { useEffect, useState } from 'react';
import { ClipboardList, UserCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MaintenanceTable from '../common/MaintenanceTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import { maintenanceService, userService } from '../../services/dataService';

const AdminMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [techs, setTechs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tech, setTech] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [r, t] = await Promise.all([
        maintenanceService.list({ page: 1, limit: 100 }),
        userService.technicians(true),
      ]);
      setRequests(r?.requests || []);
      setTechs(t || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAssignModal = (request) => {
    setSelected(request);
    setError('');
    // Auto-select first available technician if present
    if (techs && techs.length > 0) {
      setTech(techs[0].userId || techs[0]._id);
    } else {
      setTech('');
    }
  };

  const assign = async () => {
    if (!selected || !tech) return;
    try {
      setSaving(true);
      setError('');
      await maintenanceService.assign(selected.requestId || selected._id, tech);
      setSelected(null);
      setTech('');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to assign technician.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && requests.length === 0) return <LoadingBlock text="Loading maintenance queue..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Maintenance Requests"
        description="Review reported issues, verify priorities and assign available technicians to the same request."
        icon={ClipboardList}
      />

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((x) => (
          <div key={x} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <StatusBadge status={x} />
            <p className="mt-3 text-2xl font-bold text-[#09284d]">
              {requests.filter((r) => r.status === x).length}
            </p>
          </div>
        ))}
      </div>

      <MaintenanceTable
        requests={requests}
        basePath="/admin/maintenance"
        action={(r) =>
          r.status === 'PENDING' ? (
            <button
              onClick={() => openAssignModal(r)}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-[9px] font-bold text-white hover:bg-blue-700 transition cursor-pointer"
            >
              <UserCheck size={13} />
              Assign
            </button>
          ) : null
        }
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Assign Available Technician"
        description={
          selected
            ? `${selected.requestId} • ${selected.assetId?.assetName || 'Asset'} (${selected.assetId?.assetId || ''})`
            : ''
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Issue Summary</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{selected?.issueDescription}</p>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
              <span>Priority: <b>{selected?.priority}</b></span>
              <span>•</span>
              <span>Location: <b>{selected?.assetId?.location || 'General'}</b></span>
            </div>
          </div>

          {techs.length === 0 ? (
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800">
              <p className="font-bold">⚠️ No technicians are currently marked Available.</p>
              <p className="mt-1 text-amber-700">
                All certified technicians currently have active maintenance jobs or are offline. They will become selectable once their jobs are completed.
              </p>
            </div>
          ) : (
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Available Certified Technician ({techs.length} ready)
              </span>
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              >
                <option value="">-- Select Available Technician --</option>
                {techs.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.name} ({t.userId}) • {t.specialization || 'Biomedical'} • {t.activeWorkload || 0} active jobs
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button loading={saving} disabled={!tech || techs.length === 0} onClick={assign} icon={UserCheck}>
              Assign Technician
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMaintenance;
