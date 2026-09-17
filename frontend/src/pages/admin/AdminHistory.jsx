import { useEffect, useState, useMemo } from 'react';
import { History, Search, Filter, Calendar, Wrench, X, ChevronLeft, ChevronRight, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { EmptyBlock, Alert, LoadingBlock } from '../../components/common/Feedback';
import SearchInputWithSuggestions from '../../components/common/SearchInputWithSuggestions';
import { historyService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const AdminHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rolePrefix = user?.role?.toLowerCase() || 'admin';

  useEffect(() => {
    setLoading(true);
    historyService.list({ page: 1, limit: 100 })
      .then((res) => setData(res?.records || []))
      .catch((e) => setError(e.response?.data?.message || 'Unable to load permanent maintenance history from MongoDB.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const queryTokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return data.filter((h) => {
      // Filter by Maintenance Type
      if (selectedType !== 'ALL' && h.maintenanceType !== selectedType) {
        return false;
      }

      if (queryTokens.length === 0) return true;

      const searchableText = [
        h.historyId,
        h.assetId?.assetId,
        h.assetId?.assetName,
        h.assetId?.assetType,
        h.assetId?.department,
        h.assetId?.location,
        h.technicianId?.name,
        h.technicianId?.userId,
        h.technicianId?.specialization,
        h.issueDescription,
        h.diagnosis,
        h.workPerformed,
        h.partsReplaced,
        h.maintenanceType,
        h.result,
        h.remarks,
        `₹${h.maintenanceCost}`,
        `${h.downtime} hours`,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => searchableText.includes(token));
    });
  }, [data, q, selectedType]);

  const historySuggestions = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    const map = new Map();

    data.forEach((h) => {
      const assetName = h.assetId?.assetName;
      const assetId = h.assetId?.assetId;
      const diag = h.diagnosis;
      const techName = h.technicianId?.name;

      if (assetName && assetName.toLowerCase().includes(trimmed) && !map.has(assetName)) {
        map.set(assetName, {
          title: assetName,
          subtitle: `Equipment • ${h.assetId?.department || 'Hospital'}`,
          badge: assetId || h.historyId,
          icon: Wrench,
        });
      }

      if (assetId && assetId.toLowerCase().includes(trimmed) && !map.has(assetId)) {
        map.set(assetId, {
          title: `${assetName || 'Equipment'} (${assetId})`,
          subtitle: `Asset ID • ${h.historyId}`,
          badge: assetId,
          icon: Wrench,
        });
      }

      if (h.historyId && h.historyId.toLowerCase().includes(trimmed) && !map.has(h.historyId)) {
        map.set(h.historyId, {
          title: `Ticket ${h.historyId}`,
          subtitle: `${assetName || 'Equipment'} • ₹${h.maintenanceCost}`,
          badge: h.historyId,
          icon: History,
        });
      }

      if (diag && diag.toLowerCase().includes(trimmed) && !map.has(diag)) {
        map.set(diag, {
          title: diag,
          subtitle: `Diagnosis • ${assetName || 'Equipment'}`,
          badge: h.historyId,
          icon: Wrench,
        });
      }
    });

    return Array.from(map.values()).slice(0, 8);
  }, [q, data]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  if (loading && data.length === 0) {
    return <LoadingBlock text="Loading permanent maintenance history from MongoDB..." />;
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Maintenance History"
        description="Permanent asset-linked service records retained after every completed maintenance event in MongoDB."
        icon={History}
      />

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xl">
          <SearchInputWithSuggestions
            value={q}
            onChange={(val) => {
              setQ(val);
              setPage(1);
            }}
            placeholder="Search by equipment name, asset ID (e.g. IP-102), technician, diagnosis..."
            suggestions={historySuggestions}
            minChars={2}
          />
        </div>

        {/* Maintenance Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredRows.length}</strong> of{' '}
          <strong className="text-slate-800">{data.length}</strong> total history records
        </span>
        {q && (
          <button
            onClick={() => {
              setQ('');
              setSelectedType('ALL');
              setPage(1);
            }}
            className="font-semibold text-blue-600 hover:underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* History Records List */}
      {filteredRows.length === 0 ? (
        <EmptyBlock
          title="No maintenance records found"
          text={q ? `No equipment history matched "${q}". Try another keyword or clear filters.` : "No maintenance records currently available."}
        />
      ) : (
        <div className="grid gap-4">
          {paginatedRows.map((h) => (
            <div
              key={h.historyId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {h.historyId}
                    </span>
                    <StatusBadge status="COMPLETED" />
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                      {h.maintenanceType || 'PREVENTIVE'}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{h.assetId?.assetName || 'Hospital Equipment'}</span>
                    <button
                      onClick={() => navigate(`/${rolePrefix}/assets/${h.assetId?.assetId || h.assetId}`)}
                      className="font-mono text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                      ({h.assetId?.assetId || 'ID'})
                    </button>
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Completed: {h.maintenanceDate ? new Date(h.maintenanceDate).toLocaleString('en-IN') : '—'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-2 text-right border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Cost</p>
                    <p className="text-base font-bold text-slate-900">
                      ₹{Number(h.maintenanceCost || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reported Issue</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-700">{h.issueDescription || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnosis</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-700">{h.diagnosis || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technician</p>
                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {h.technicianId?.name || (typeof h.technicianId === 'string' ? h.technicianId : 'Assigned Technician')}
                  </p>
                  {h.technicianId?.specialization && (
                    <p className="text-[10px] text-slate-400">({h.technicianId.specialization})</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Downtime</p>
                  <p className="mt-1 text-xs font-bold text-slate-800">{h.downtime || 0} hours</p>
                </div>
              </div>

              {h.workPerformed && (
                <div className="mt-3 rounded-xl bg-blue-50/40 p-3 text-xs text-slate-700 border border-blue-100/60">
                  <strong className="text-blue-900">Work Performed: </strong>
                  {h.workPerformed}
                  {h.partsReplaced && h.partsReplaced !== 'None' && (
                    <span className="block mt-1 text-[11px] text-slate-500">
                      <strong>Parts Replaced:</strong> {h.partsReplaced}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
          <span>
            Page <strong className="text-slate-900">{page}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 font-medium disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 font-medium disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;
