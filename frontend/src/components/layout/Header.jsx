import { useEffect, useState, useRef } from 'react';
import { Bell, ChevronDown, LogOut, Menu, User, Search, Package, Wrench, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { notificationService, assetService } from '../../services/dataService';

export default function Header({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Global Header Search
  const [globalQuery, setGlobalQuery] = useState('');
  const [allAssets, setAllAssets] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const rolePath = user?.role?.toLowerCase() || 'admin';

  const fetchUnread = async () => {
    try {
      const res = await notificationService.list();
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // ignore silently
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user?.userId]);

  // Pre-load assets for instant global search in header
  useEffect(() => {
    assetService.list({ limit: 100 })
      .then((res) => setAllAssets(res?.assets || []))
      .catch(() => {});
  }, []);

  // Handle global search filtering
  useEffect(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const matches = allAssets.filter((a) =>
      [
        a.assetId,
        a.assetName,
        a.category,
        a.department,
        a.location,
        a.serialNumber,
        a.manufacturer,
        a.model,
      ].some((val) => String(val || '').toLowerCase().includes(q))
    ).slice(0, 6);

    setSearchResults(matches);
    setSearchOpen(true);
  }, [globalQuery, allAssets]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (assetId) => {
    setGlobalQuery('');
    setSearchOpen(false);
    navigate(`/${rolePath}/assets/${assetId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalQuery.trim()) {
      setSearchOpen(false);
      navigate(`/${rolePath}/assets`);
    }
  };

  const handleNotificationClick = () => {
    navigate(`/${rolePath}/notifications`);
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate(`/${rolePath}/profile`);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[70px] w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Trigger & Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Instant Equipment Search */}
        <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                onFocus={() => {
                  if (globalQuery.trim()) setSearchOpen(true);
                }}
                placeholder="Search medical equipment by name, ID, category, ward..."
                className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-8 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />
              {globalQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Quick Autocomplete Suggestions Dropdown */}
          {searchOpen && (
            <div className="absolute left-0 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-scale-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Equipment Matches ({searchResults.length})
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No medical equipment found for "{globalQuery}"
                </div>
              ) : (
                <div className="space-y-1 mt-1 max-h-72 overflow-y-auto">
                  {searchResults.map((a) => (
                    <button
                      key={a.assetId}
                      onClick={() => handleSelectSearchResult(a.assetId)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-blue-50/50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-mono text-[10px] font-bold">
                          <Package size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {a.assetName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {a.department || 'General'} • {a.location || 'Hospital'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {a.assetId}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <button
          onClick={handleNotificationClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="View notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3 hover:bg-slate-100/80 transition cursor-pointer"
          >
            {/* User Avatar Circle */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                : 'U'}
            </div>

            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {user?.name || (user?.role === 'ADMIN' ? 'Admin' : user?.userId)}
            </span>

            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </p>
                <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleProfileClick}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <User size={15} />
                <span>My Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
