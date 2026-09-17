import { useEffect, useState, useMemo } from 'react';
import { Wrench, Filter, CheckCircle2, Clock, Activity, ClipboardList } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MaintenanceTable from '../common/MaintenanceTable';
import StatusBadge from '../../components/common/StatusBadge';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import { maintenanceService } from '../../services/dataService';

const TechnicianRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await maintenanceService.list({ page: 1, limit: 100 });
      setData(res?.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load assigned requests from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const counts = useMemo(() => {
    return {
      all: data.length,
      assigned: data.filter((r) => r.status === 'ASSIGNED').length,
      inProgress: data.filter((r) => r.status === 'IN_PROGRESS').length,
      completed: data.filter((r) => r.status === 'COMPLETED').length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (activeFilter === 'ALL') return data;
    return data.filter((r) => r.status === activeFilter);
  }, [data, activeFilter]);

  if (loading && data.length === 0) {
    return <LoadingBlock text="Loading technician maintenance work orders..." />;
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Assigned Maintenance Work Orders"
        description="Inspect reported equipment issues, begin active repairs, and submit permanent completion service records."
        icon={Wrench}
      />

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ClipboardList size={14} />
          <span>All Work Orders</span>
          <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('ASSIGNED')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeFilter === 'ASSIGNED'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock size={14} className="text-blue-500" />
          <span>Assigned (Ready to Start)</span>
          <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === 'ASSIGNED' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {counts.assigned}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} className="text-violet-500" />
          <span>In Progress</span>
          <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === 'IN_PROGRESS' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {counts.inProgress}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeFilter === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>Completed Service Records</span>
          <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === 'COMPLETED' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {counts.completed}
          </span>
        </button>
      </div>

      {/* Main Table with Auto-Suggestions & Search */}
      <MaintenanceTable requests={filteredData} basePath="/technician/requests" />
    </div>
  );
};

export default TechnicianRequests;
