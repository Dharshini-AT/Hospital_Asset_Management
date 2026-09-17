import { useEffect, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/dataService';

export default function Header({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const handleNotificationClick = () => {
    const rolePath = user?.role?.toLowerCase() || 'admin';
    navigate(`/${rolePath}/notifications`);
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    const rolePath = user?.role?.toLowerCase() || 'admin';
    navigate(`/${rolePath}/profile`);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[70px] w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Trigger / Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right: Notifications & Profile Header */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={handleNotificationClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="View notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-full py-1.5 pl-2 pr-3 hover:bg-slate-100/80 transition cursor-pointer"
          >
            {/* User Avatar Circle */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 text-xs font-bold text-slate-700">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                : 'A'}
            </div>

            <span className="text-xs font-bold text-slate-800">
              {user?.name || (user?.role === 'ADMIN' ? 'Admin' : user?.userId)}
            </span>

            <ChevronDown size={15} className="text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-scale-in">
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
