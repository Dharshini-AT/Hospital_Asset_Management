import { useState, useMemo } from 'react';
import { Eye, Wrench, Search, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { EmptyBlock } from '../../components/common/Feedback';

const MaintenanceTable = ({ requests = [], basePath, action, showSearch = true }) => {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRequests = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return requests.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;

      if (tokens.length === 0) return true;

      const searchable = [
        r.requestId,
        r.assetId?.assetId,
        r.assetId?.assetName,
        r.assetId?.department,
        r.assetId?.location,
        r.issueType,
        r.issueDescription,
        r.reportedBy?.name,
        r.reportedBy?.userId,
        r.assignedTechnician?.name,
        r.assignedTechnician?.userId,
        r.priority,
        r.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => searchable.includes(token));
    });
  }, [requests, q, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, page, pageSize]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      {showSearch && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by equipment, request ID, issue, priority..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-8 text-xs text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
            {q && (
              <button
                onClick={() => {
                  setQ('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Card */}
      {filteredRequests.length === 0 ? (
        <EmptyBlock
          title="No maintenance requests found"
          text={q || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? "No requests matched your search criteria. Try clearing search filters." : "New issues will appear here as soon as they are reported in MongoDB."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Request ID', 'Medical Equipment', 'Issue Description', 'Reported By', 'Priority', 'Current Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRequests.map((r) => (
                  <tr
                    key={r.requestId}
                    onClick={() => nav(`${basePath}/${r.requestId}`)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {r.requestId}
                      </span>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-800">
                        {r.assetId?.assetName || 'Equipment'}
                      </p>
                      <p className="text-[10px] font-mono text-blue-600">
                        {r.assetId?.assetId || 'ID'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {r.assetId?.department || 'General'}
                      </p>
                    </td>

                    <td className="max-w-[260px] px-5 py-4 text-xs text-slate-600">
                      <span className="line-clamp-2 font-medium">{r.issueDescription}</span>
                      {r.issueType && (
                        <span className="mt-1 inline-block text-[9px] font-bold text-slate-400 uppercase">
                          Type: {r.issueType}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-700">
                      <p className="font-semibold">{r.reportedBy?.name || 'Staff'}</p>
                      <p className="text-[10px] text-slate-400">{r.reportedBy?.department || 'ICU'}</p>
                    </td>

                    <td className="px-5 py-4">
                      <PriorityBadge priority={r.priority} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                      {r.assignedTechnician && (
                        <p className="mt-1 text-[10px] text-slate-400 truncate">
                          Tech: {r.assignedTechnician?.name || r.assignedTechnician}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => nav(`${basePath}/${r.requestId}`)}
                          title="View Workflow Details"
                          className="flex h-8 items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        {action?.(r)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50 text-xs text-slate-600">
              <span>
                Showing page <strong className="text-slate-900">{page}</strong> of{' '}
                <strong className="text-slate-900">{totalPages}</strong> ({filteredRequests.length} requests)
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
      )}
    </div>
  );
};

export default MaintenanceTable;
