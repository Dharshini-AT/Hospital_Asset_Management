import { NavLink, useNavigate } from 'react-router';
import {
  BarChart2,
  Bell,
  Clock,
  FileText,
  Heart,
  Home,
  LogOut,
  Package,
  Plus,
  Settings,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleMenus = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { label: 'Assets', path: '/admin/assets', icon: Package },
    { label: 'Maintenance Requests', path: '/admin/maintenance', icon: FileText },
    { label: 'Maintenance History', path: '/admin/history', icon: Clock },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Reports', path: '/admin/reports', icon: BarChart2 },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  ],
  STAFF: [
    { label: 'Dashboard', path: '/staff/dashboard', icon: Home },
    { label: 'Assets', path: '/staff/assets', icon: Package },
    { label: 'Maintenance Requests', path: '/staff/requests', icon: FileText },
    { label: 'Report Issue', path: '/staff/report-issue', icon: Wrench },
    { label: 'Notifications', path: '/staff/notifications', icon: Bell },
  ],
  TECHNICIAN: [
    { label: 'Dashboard', path: '/technician/dashboard', icon: Home },
    { label: 'Maintenance Requests', path: '/technician/requests', icon: FileText },
    { label: 'Assets', path: '/technician/assets', icon: Package },
    { label: 'Maintenance History', path: '/technician/history', icon: Clock },
    { label: 'Notifications', path: '/technician/notifications', icon: Bell },
  ],
};

const roleTitles = {
  ADMIN: 'Administrator',
  STAFF: 'Staff Nurse',
  TECHNICIAN: 'Biomedical Engineer',
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'ADMIN';
  const menuItems = roleMenus[role] || roleMenus.ADMIN;

  const handleProfileClick = () => {
    navigate(`/${role.toLowerCase()}/profile`);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#0b192c] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo Header */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            {/* White Cross Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0066ff] shadow-md">
              <Plus size={26} className="text-[#0066ff] stroke-[3.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Hospital Asset
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                Management
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#0066ff] text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="border-t border-slate-800/80 p-4">
          <div
            onClick={handleProfileClick}
            className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/10 cursor-pointer"
          >
            {/* Circular Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#0066ff]">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                : 'A'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">
                {user?.name || 'Admin'}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {user?.designation || roleTitles[role] || 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
