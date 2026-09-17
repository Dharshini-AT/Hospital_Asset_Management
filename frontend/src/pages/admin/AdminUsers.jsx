import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, ShieldCheck, Trash2, UserPlus, Mail, Lock, Phone, Briefcase, Building, Wrench } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import FormField, { inputClass, selectClass } from '../../components/common/FormField';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import SearchInputWithSuggestions from '../../components/common/SearchInputWithSuggestions';
import { userService } from '../../services/dataService';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'STAFF',
  phone: '',
  designation: '',
  department: 'General Ward',
  specialization: '',
};

const DEPARTMENTS = [
  'ICU',
  'Radiology',
  'Laboratory',
  'Operation Theatre',
  'General Ward',
  'Cardiology',
  'Pediatrics',
  'Emergency',
  'Biomedical Engineering',
  'Administration',
];

const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await userService.list({ page: 1, limit: 100, search: q });
      setData(res?.users || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load users from MongoDB database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenModal = () => {
    setForm(initialForm);
    setModalError('');
    setOpen(true);
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setModalError('');
      const createdUser = await userService.create(form);
      setSuccessMsg(`User ${createdUser?.name || form.name} (${createdUser?.userId || 'created'}) added to MongoDB successfully!`);
      setForm(initialForm);
      setOpen(false);
      await load();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      setModalError(e.response?.data?.message || 'Unable to create user in database. Please check input values.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}" (${userId}) from MongoDB?`)) return;
    try {
      await userService.remove(userId);
      setSuccessMsg(`User ${userId} was deleted from the database.`);
      await load();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to remove user.');
    }
  };

  const rows = data.filter((u) =>
    [u.name, u.email, u.userId, u.role, u.department, u.designation]
      .some((v) => String(v || '').toLowerCase().includes(q.toLowerCase()))
  );

  const userSuggestions = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    return data
      .filter((u) =>
        [u.name, u.email, u.userId, u.role, u.department, u.designation]
          .some((v) => String(v || '').toLowerCase().includes(trimmed))
      )
      .slice(0, 8)
      .map((u) => ({
        title: u.name,
        subtitle: `${u.role} • ${u.department || 'General'} (${u.designation || 'Staff'})`,
        badge: u.userId,
        onSelect: () => setQ(u.name),
      }));
  }, [q, data]);

  if (loading && data.length === 0) {
    return <LoadingBlock text="Loading authorized hospital users from database..." />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        description="Manage and create authorized hospital accounts. New accounts are hashed and saved directly into MongoDB."
        icon={ShieldCheck}
        action={
          <Button icon={Plus} onClick={handleOpenModal}>
            New User
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4">
          <Alert type="success">{successMsg}</Alert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {/* Search Bar with auto-suggestions */}
      <div className="mb-5 max-w-xl">
        <SearchInputWithSuggestions
          value={q}
          onChange={setQ}
          placeholder="Search by user name, ID (e.g. ADM-001), role, department or email..."
          suggestions={userSuggestions}
          minChars={2}
        />
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['User Details', 'Role & Designation', 'Department', 'Contact', 'Account Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No matching users found in the database.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.userId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 border border-blue-100">
                          {u.name
                            ?.split(' ')
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] font-mono font-medium text-blue-600">{u.userId}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.role} />
                      <p className="mt-1 text-[10px] text-slate-500">{u.designation || 'Staff Member'}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">
                      {u.department || '—'}
                      {u.specialization && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">({u.specialization})</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">{u.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.accountStatus || 'ACTIVE'} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => remove(u.userId, u.name)}
                        title="Delete User"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add New Hospital User"
        description="Fill in the details below to create a real hospital account in MongoDB."
        size="lg"
      >
        {modalError && (
          <div className="mb-4">
            <Alert type="error">{modalError}</Alert>
          </div>
        )}

        <form onSubmit={create} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <FormField label="Full Name" required>
              <input
                required
                placeholder="e.g. Dr. Ramesh Kumar"
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </FormField>

            {/* Email */}
            <FormField label="Email Address" required>
              <input
                required
                type="email"
                placeholder="e.g. ramesh.kumar@hospital.com"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>

            {/* Password */}
            <FormField label="Password" required hint="Minimum 6 characters (bcrypt-hashed)">
              <input
                required
                minLength={6}
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </FormField>

            {/* Role */}
            <FormField label="Role" required hint="Determines dashboard and action permissions">
              <select
                className={selectClass}
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value;
                  setForm({
                    ...form,
                    role,
                    department: role === 'ADMIN' ? 'Administration' : role === 'TECHNICIAN' ? 'Biomedical Engineering' : form.department,
                  });
                }}
              >
                <option value="STAFF">STAFF (Report issues, view assets)</option>
                <option value="TECHNICIAN">TECHNICIAN (Handle maintenance requests)</option>
                <option value="ADMIN">ADMIN (Full system access)</option>
              </select>
            </FormField>

            {/* Phone */}
            <FormField label="Phone Number">
              <input
                placeholder="e.g. +91-98765-43210"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormField>

            {/* Designation */}
            <FormField label="Designation">
              <input
                placeholder={form.role === 'ADMIN' ? 'e.g. Equipment Manager' : form.role === 'TECHNICIAN' ? 'e.g. Biomedical Technician' : 'e.g. Staff Nurse'}
                className={inputClass}
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </FormField>

            {/* Department */}
            <FormField label="Department" required>
              <select
                className={selectClass}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Specialization (for Technicians) */}
            <FormField
              label="Specialization"
              hint={form.role === 'TECHNICIAN' ? 'Primary equipment specialty' : 'Optional'}
            >
              <input
                placeholder="e.g. Biomedical, Radiology, Electrical"
                className={inputClass}
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </FormField>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} icon={UserPlus}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
