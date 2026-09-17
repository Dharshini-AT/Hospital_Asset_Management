import { useEffect, useState, useMemo } from 'react';
import { Search, Users, Wrench, X, Phone, Mail, CheckCircle2, Clock } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import StatusBadge from '../../components/common/StatusBadge';
import { Alert, LoadingBlock, EmptyBlock } from '../../components/common/Feedback';
import SearchInputWithSuggestions from '../../components/common/SearchInputWithSuggestions';
import { userService } from '../../services/dataService';

const AdminTechnicians = () => {
  const [techs, setTechs] = useState([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.technicians()
      .then((x) => setTechs(x || []))
      .catch((e) => setError(e.response?.data?.message || 'Unable to load technicians from MongoDB.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredTechs = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return techs.filter((t) => {
      if (statusFilter !== 'ALL' && t.availabilityStatus !== statusFilter) return false;

      if (tokens.length === 0) return true;

      const searchable = [
        t.name,
        t.userId,
        t.email,
        t.phone,
        t.specialization,
        t.department,
        t.availabilityStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => searchable.includes(token));
    });
  }, [techs, q, statusFilter]);

  const techSuggestions = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    return techs
      .filter((t) =>
        [t.name, t.userId, t.specialization, t.department, t.availabilityStatus]
          .some((v) => String(v || '').toLowerCase().includes(trimmed))
      )
      .slice(0, 8)
      .map((t) => ({
        title: t.name,
        subtitle: `${t.specialization || 'Biomedical'} • ${t.department || 'Hospital'} (${t.activeWorkload || 0} active)`,
        badge: t.userId,
        icon: Users,
        onSelect: () => setQ(t.name),
      }));
  }, [q, techs]);

  if (loading && techs.length === 0) {
    return <LoadingBlock text="Loading biomedical technician directory..." />;
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Technician Directory"
        description="Monitor real-time availability, equipment specialization, and live assigned maintenance workloads in MongoDB."
        icon={Wrench}
      />

      {error && <Alert type="error">{error}</Alert>}

      {/* Search & Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchInputWithSuggestions
            value={q}
            onChange={setQ}
            placeholder="Search by technician name, ID (e.g. TEC-001), specialization, ward..."
            suggestions={techSuggestions}
            minChars={2}
          />
        </div>

        {/* Availability Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'All Technicians' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredTechs.length}</strong> of{' '}
          <strong className="text-slate-800">{techs.length}</strong> registered technicians
        </span>
        {(q || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setQ('');
              setStatusFilter('ALL');
            }}
            className="font-semibold text-blue-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Technician Cards Grid */}
      {filteredTechs.length === 0 ? (
        <EmptyBlock
          title="No technicians found"
          text={q ? `No technicians matched "${q}". Try another keyword or status.` : "No technicians registered in the database."}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTechs.map((x) => (
            <div
              key={x.userId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-sm">
                      {x.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{x.name}</p>
                      <p className="font-mono text-xs font-bold text-blue-600">{x.userId}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                        {x.specialization || 'Biomedical Equipment'}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={x.availabilityStatus || 'AVAILABLE'} />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p className="truncate">
                    <span className="text-slate-400 font-medium">Department: </span>
                    {x.department || 'Biomedical Engineering'}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400 font-medium">Email: </span>
                    {x.email || '—'}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400 font-medium">Phone: </span>
                    {x.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Active Workload</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {x.activeWorkload || 0}{' '}
                    <span className="text-xs font-normal text-slate-500">tickets</span>
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {x.availabilityStatus === 'BUSY'
                      ? 'In Service'
                      : x.availabilityStatus === 'AVAILABLE'
                      ? 'Ready to Assign'
                      : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTechnicians;
