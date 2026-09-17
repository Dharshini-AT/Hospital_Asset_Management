import { useEffect, useState, useMemo } from 'react';
import { Bell, CheckCheck, Search, X, CheckCircle2, Clock } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Button from '../../components/common/Button';
import { Alert, EmptyBlock, LoadingBlock } from '../../components/common/Feedback';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInputWithSuggestions from '../../components/common/SearchInputWithSuggestions';
import { notificationService } from '../../services/dataService';

const Notifications = () => {
  const [d, setD] = useState({ items: [], unreadCount: 0 });
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationService.list();
      setD(res || { items: [], unreadCount: 0 });
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load notifications from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const read = async (id) => {
    try {
      await notificationService.read(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to update notification.');
    }
  };

  const readAll = async () => {
    try {
      await notificationService.readAll();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to update notifications.');
    }
  };

  const filteredItems = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return (d.items || []).filter((n) => {
      if (filter === 'UNREAD' && n.isRead) return false;
      if (filter === 'READ' && !n.isRead) return false;

      if (tokens.length === 0) return true;

      const searchable = [
        n.title,
        n.message,
        n.notificationId,
        n.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => searchable.includes(token));
    });
  }, [d.items, q, filter]);

  const notifSuggestions = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    return (d.items || [])
      .filter((n) =>
        [n.title, n.message, n.type]
          .some((v) => String(v || '').toLowerCase().includes(trimmed))
      )
      .slice(0, 8)
      .map((n) => ({
        title: n.title,
        subtitle: n.message,
        badge: n.type || 'NOTIFICATION',
        icon: Bell,
        onSelect: () => setQ(n.title),
      }));
  }, [q, d.items]);

  if (loading && (!d.items || d.items.length === 0)) {
    return <LoadingBlock text="Loading notifications from MongoDB..." />;
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader
        title="Notifications"
        description="Stay informed about equipment assignments, maintenance progress, warranty milestones and system events in MongoDB."
        icon={Bell}
        action={
          <Button
            variant="outline"
            icon={CheckCheck}
            onClick={readAll}
            disabled={!d.unreadCount}
          >
            Mark all read
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchInputWithSuggestions
            value={q}
            onChange={setQ}
            placeholder="Search notification title, message content..."
            suggestions={notifSuggestions}
            minChars={2}
          />
        </div>

        {/* Read / Unread Filter Pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: `All (${d.items?.length || 0})` },
            { id: 'UNREAD', label: `Unread (${d.unreadCount || 0})` },
            { id: 'READ', label: 'Read' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filteredItems.length === 0 ? (
        <EmptyBlock
          title="No notifications found"
          text={q ? `No notifications matched "${q}".` : "You're all caught up with hospital events."}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((n) => (
            <div
              key={n._id || n.notificationId}
              className={`rounded-2xl border p-4 shadow-sm transition ${
                n.isRead
                  ? 'border-slate-200 bg-white'
                  : 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100'
              }`}
            >
              <div className="flex gap-3.5 items-start">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    n.isRead
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Bell size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-600">{n.message}</p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : '—'}
                  </p>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => read(n._id || n.notificationId)}
                    className="self-start rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
