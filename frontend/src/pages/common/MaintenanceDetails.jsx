import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, CheckCircle2, Circle, Clock, Play, UserCheck, Wrench } from 'lucide-react';
import { maintenanceService, userService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { LoadingBlock, Alert } from '../../components/common/Feedback';

export default function MaintenanceDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Maintenance Details Form State for Technician (Screenshot 5)
  const [form, setForm] = useState({
    diagnosis: '',
    maintenanceCost: '',
    workPerformed: '',
    conditionAfterMaintenance: 'GOOD',
    partsReplaced: '',
    remarks: '',
    downtime: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [reqData, techs] = await Promise.all([
        maintenanceService.get(requestId),
        userService.technicians(),
      ]);

      setRequest(reqData);
      setTechnicians(techs || []);

      if (techs && techs.length > 0) {
        const available = techs.find((t) => t.availabilityStatus === 'AVAILABLE');
        if (available) {
          setSelectedTechId(available.userId || available._id);
        } else {
          setSelectedTechId(techs[0].userId || techs[0]._id);
        }
      }

      // Pre-fill form if existing
      if (reqData.diagnosis) {
        setForm({
          diagnosis: reqData.diagnosis || '',
          maintenanceCost: reqData.maintenanceCost?.toString() || '0',
          workPerformed: reqData.workPerformed || '',
          conditionAfterMaintenance: reqData.conditionAfterMaintenance || 'GOOD',
          partsReplaced: reqData.partsReplaced || '',
          remarks: reqData.remarks || '',
          downtime: reqData.downtime?.toString() || '0',
        });
      }
    } catch (err) {
      console.error('Failed to load maintenance request:', err);
      setError(err.response?.data?.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleAssignTechnician = async () => {
    if (!selectedTechId) {
      alert('Please select an available technician.');
      return;
    }
    try {
      setActionLoading(true);
      setError('');
      await maintenanceService.assign(request.requestId || request._id, selectedTechId);
      setSuccessMessage('Technician assigned successfully!');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartMaintenance = async () => {
    try {
      setActionLoading(true);
      setError('');
      await maintenanceService.start(request.requestId || request._id);
      setSuccessMessage('Maintenance marked as In Progress!');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start maintenance work.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMaintenance = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      await maintenanceService.complete(request.requestId || request._id, {
        diagnosis: form.diagnosis,
        workPerformed: form.workPerformed,
        partsReplaced: form.partsReplaced,
        downtime: Number(form.downtime || 0),
        maintenanceCost: Number(form.maintenanceCost || 0),
        conditionAfterMaintenance: form.conditionAfterMaintenance,
        remarks: form.remarks,
      });
      setSuccessMessage('Maintenance completed! Asset condition updated and permanent history recorded in MongoDB.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete maintenance.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingBlock text="Loading Maintenance Request Details..." />;
  }

  if (error && !request) {
    return <Alert>{error}</Alert>;
  }

  if (!request) return null;

  const role = user?.role || 'ADMIN';
  const isTechnician = role === 'TECHNICIAN';
  const isAdmin = role === 'ADMIN';

  const backPath = `/${role.toLowerCase()}/maintenance`;

  // Status Stepper Steps
  const steps = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const statusIndexMap = {
    PENDING: 0,
    ASSIGNED: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
  };

  const currentStepIndex = statusIndexMap[request.status] ?? 0;

  const formattedCreated = request.reportedAt || request.createdAt
    ? new Date(request.reportedAt || request.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '2026-02-14 10:30 AM';

  const formattedAssigned = request.assignedAt
    ? new Date(request.assignedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '2026-02-14 11:45 AM';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Title & Back to Requests link */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0a192f]">
          {isTechnician ? 'Technician View' : 'Maintenance Requests'}
        </h1>
        <button
          onClick={() => navigate(backPath)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Requests</span>
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600">×</button>
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      {/* Top Row: Request Info (Left Card) & Status Stepper (Right Card) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Left Card */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {/* Header with MR-ID & Badge */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {request.requestId}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                request.status === 'PENDING'
                  ? 'bg-amber-100/70 text-amber-700'
                  : request.status === 'ASSIGNED'
                  ? 'bg-blue-100/70 text-blue-700'
                  : request.status === 'IN_PROGRESS'
                  ? 'border border-blue-500 bg-blue-50 text-blue-600'
                  : 'bg-emerald-100/70 text-emerald-700'
              }`}
            >
              {request.status === 'IN_PROGRESS'
                ? 'In Progress'
                : request.status
                ? request.status.charAt(0) + request.status.slice(1).toLowerCase()
                : 'Pending'}
            </span>
          </div>

          {/* Key-Value Details */}
          <div className="space-y-4 text-xs">
            {isTechnician ? (
              <>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold text-slate-500">Asset ID</span>
                  <span className="col-span-8 font-bold text-slate-800">
                    {request.assetId?.assetId || 'IP-102'}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold text-slate-500">Asset Name</span>
                  <span className="col-span-8 font-bold text-slate-800">
                    {request.assetId?.assetName || 'Infusion Pump'}
                  </span>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-12">
                <span className="col-span-4 font-semibold text-slate-500">Asset</span>
                <span className="col-span-8 font-bold text-slate-800">
                  {request.assetId?.assetId} - {request.assetId?.assetName}
                </span>
              </div>
            )}

            <div className="grid grid-cols-12">
              <span className="col-span-4 font-semibold text-slate-500">Issue</span>
              <span className="col-span-8 text-slate-700 font-medium">
                {request.issueDescription || 'Not delivering fluid correctly'}
              </span>
            </div>

            <div className="grid grid-cols-12 items-center">
              <span className="col-span-4 font-semibold text-slate-500">Priority</span>
              <span className="col-span-8">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    request.priority === 'HIGH' || request.priority === 'CRITICAL'
                      ? 'bg-red-50 text-red-600'
                      : request.priority === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {request.priority ? request.priority.charAt(0) + request.priority.slice(1).toLowerCase() : 'High'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-12">
              <span className="col-span-4 font-semibold text-slate-500">Reported By</span>
              <span className="col-span-8 text-slate-700 font-medium">
                {request.reportedBy?.name || 'Staff Nurse'} ({request.reportedBy?.userId || 'STAFF-001'})
              </span>
            </div>

            {request.assignedBy && (
              <div className="grid grid-cols-12">
                <span className="col-span-4 font-semibold text-slate-500">Assigned By</span>
                <span className="col-span-8 text-slate-700 font-medium">
                  {request.assignedBy?.name || 'Admin'} ({request.assignedBy?.userId || 'ADM-001'})
                </span>
              </div>
            )}

            {request.assignedAt && (
              <div className="grid grid-cols-12">
                <span className="col-span-4 font-semibold text-slate-500">Assigned At</span>
                <span className="col-span-8 text-slate-700 font-medium">
                  {formattedAssigned}
                </span>
              </div>
            )}

            <div className="grid grid-cols-12">
              <span className="col-span-4 font-semibold text-slate-500">Created At</span>
              <span className="col-span-8 text-slate-700 font-medium">
                {formattedCreated}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Card: Request Status Stepper */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0a192f] mb-6">
            {isTechnician ? 'Status Progress' : 'Request Status'}
          </h2>

          <div className="relative pl-6 space-y-7">
            {/* Vertical connecting line */}
            <div className="absolute left-[35px] top-3 bottom-3 w-[2px] bg-slate-200" />

            {steps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="relative flex items-center gap-4 text-xs font-semibold">
                  {/* Stepper Circle Indicator */}
                  <div
                    className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                      isCurrent
                        ? 'bg-[#0066ff] text-white ring-4 ring-blue-100'
                        : isPastOrCurrent
                        ? 'bg-[#0066ff] text-white'
                        : 'border-2 border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    {isPastOrCurrent ? (
                      <Check size={12} className="stroke-[3.5]" />
                    ) : (
                      <Circle size={8} />
                    )}
                  </div>

                  <span
                    className={`${
                      isCurrent
                        ? 'font-bold text-slate-900 text-sm'
                        : isPastOrCurrent
                        ? 'font-bold text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Role-Specific Action Card */}

      {/* 1. ADMIN ASSIGN TECHNICIAN TABLE (Screenshot 4) */}
      {isAdmin && request.status === 'PENDING' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#0a192f]">
              Assign Technician
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Available Technicians
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="py-3 px-4">Technician ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {technicians.map((tech) => {
                  const isAvailable = tech.availabilityStatus === 'AVAILABLE';
                  const isSelected = selectedTechId === tech.userId || selectedTechId === tech._id;
                  return (
                    <tr
                      key={tech.userId}
                      onClick={() => setSelectedTechId(tech.userId)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {tech.userId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {tech.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {tech.specialization || 'Biomedical'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="radio"
                          name="technicianSelect"
                          checked={isSelected}
                          onChange={() => setSelectedTechId(tech.userId)}
                          className="h-4 w-4 text-blue-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleAssignTechnician}
              disabled={actionLoading || !selectedTechId}
              className="flex items-center gap-2 rounded-xl bg-[#0066ff] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <UserCheck size={16} />
              <span>{actionLoading ? 'Assigning...' : 'Assign Technician'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TECHNICIAN READY TO START (If ASSIGNED) */}
      {(isTechnician || isAdmin) && request.status === 'ASSIGNED' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0a192f]">
              Work Order Ready to Start
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mark this request as In Progress to begin diagnosing and repairing the equipment.
            </p>
          </div>
          <button
            onClick={handleStartMaintenance}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-[#0066ff] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Play size={16} />
            <span>{actionLoading ? 'Starting...' : 'Start Maintenance'}</span>
          </button>
        </div>
      )}

      {/* 3. TECHNICIAN MAINTENANCE DETAILS WORK ORDER FORM (Screenshot 5) */}
      {(isTechnician || isAdmin) && (request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0a192f] mb-6">
            Maintenance Details
          </h2>

          <form onSubmit={handleCompleteMaintenance} className="space-y-5">
            {/* Row 1: Diagnosis & Maintenance Cost */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Diagnosis
                </label>
                <input
                  type="text"
                  required
                  disabled={request.status === 'COMPLETED'}
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="Occlusion sensor malfunction"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Maintenance Cost (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  disabled={request.status === 'COMPLETED'}
                  value={form.maintenanceCost}
                  onChange={(e) => setForm({ ...form, maintenanceCost: e.target.value })}
                  placeholder="2,500"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Row 2: Work Performed & Condition After Maintenance */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Performed
                </label>
                <input
                  type="text"
                  required
                  disabled={request.status === 'COMPLETED'}
                  value={form.workPerformed}
                  onChange={(e) => setForm({ ...form, workPerformed: e.target.value })}
                  placeholder="Replaced sensor and tested flow rate"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Condition After Maintenance
                </label>
                <select
                  disabled={request.status === 'COMPLETED'}
                  value={form.conditionAfterMaintenance}
                  onChange={(e) => setForm({ ...form, conditionAfterMaintenance: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Row 3: Parts Replaced & Remarks & Downtime */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Parts Replaced
                  </label>
                  <input
                    type="text"
                    disabled={request.status === 'COMPLETED'}
                    value={form.partsReplaced}
                    onChange={(e) => setForm({ ...form, partsReplaced: e.target.value })}
                    placeholder="Occlusion sensor (P/N 4567)"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Downtime (hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={request.status === 'COMPLETED'}
                    value={form.downtime}
                    onChange={(e) => setForm({ ...form, downtime: e.target.value })}
                    placeholder="2.5"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Remarks
                </label>
                <textarea
                  rows={4}
                  disabled={request.status === 'COMPLETED'}
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Working as expected"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Complete Button */}
            {request.status === 'IN_PROGRESS' && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#0066ff] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <Wrench size={16} />
                  <span>{actionLoading ? 'Saving...' : 'Complete Maintenance'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
