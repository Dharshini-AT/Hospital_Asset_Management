import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Edit3, X, CheckCircle2, ArrowRight, Eye, Package, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { assetService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { LoadingBlock, Alert } from '../../components/common/Feedback';
import Modal from '../../components/common/Modal';
import FormField, { inputClass, selectClass } from '../../components/common/FormField';
import Button from '../../components/common/Button';
import pumpImage from '../../assets/images/infusion_pump.svg';

export default function AssetList({ mode = 'view' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const canManage = mode === 'admin' || user?.role === 'ADMIN';
  const rolePrefix = user?.role?.toLowerCase() || 'admin';

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await assetService.list({ limit: 100 });
      const list = res?.assets || [];
      setAssets(list);

      if (list.length > 0) {
        const defaultAsset = list.find((a) => a.assetId === 'IP-102') || list[0];
        setSelectedAsset(defaultAsset);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(err.response?.data?.message || 'Failed to fetch asset records from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      [a.assetId, a.assetName, a.category, a.location, a.department, a.manufacturer, a.model]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [assets, search]);

  const totalPages = Math.ceil(filteredAssets.length / pageSize) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, page, pageSize]);

  const handleSelectAndScroll = (asset) => {
    setSelectedAsset(asset);
    setTimeout(() => {
      const el = document.getElementById('asset-details-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleViewDetailsPage = (assetId) => {
    navigate(`/${rolePrefix}/assets/${assetId}`);
  };

  const handleOpenEdit = (asset) => {
    setFormData({
      assetName: asset.assetName,
      category: asset.category || 'Life Support',
      department: asset.department,
      location: asset.location,
      currentStatus: asset.currentStatus || 'AVAILABLE',
      currentCondition: asset.currentCondition || 'GOOD',
      criticality: asset.criticality || 'HIGH',
      maintenanceType: asset.maintenanceType || 'PREVENTIVE',
      maintenanceFrequency: asset.maintenanceFrequency || '6 Months',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      setSaving(true);
      const updated = await assetService.update(selectedAsset.assetId || selectedAsset._id, formData);
      setSelectedAsset(updated);
      await loadAssets();
      setEditModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const created = await assetService.create(formData);
      setSelectedAsset(created);
      await loadAssets();
      setAddModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register asset.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && assets.length === 0) {
    return <LoadingBlock text="Loading Medical Assets & Equipment..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header: Title, Search Bar & Add Asset Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0a192f]">Assets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time hospital equipment inventory backed by MongoDB ({filteredAssets.length} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[280px] sm:min-w-[360px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search assets by ID, name, category, department..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Add Asset Button */}
          {canManage && (
            <button
              onClick={() => {
                setFormData({
                  assetId: `IP-${Math.floor(100 + Math.random() * 900)}`,
                  assetName: '',
                  assetType: 'Medical Device',
                  category: 'Life Support',
                  serialNumber: `SN${Math.floor(100000 + Math.random() * 900000)}`,
                  manufacturer: 'Medtronic',
                  model: 'MP-60',
                  department: 'ICU',
                  location: 'Room 04',
                  purchaseDate: new Date().toISOString().split('T')[0],
                  purchaseCost: 250000,
                  warrantyStartDate: new Date().toISOString().split('T')[0],
                  warrantyEndDate: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
                  currentStatus: 'AVAILABLE',
                  currentCondition: 'GOOD',
                  criticality: 'HIGH',
                  maintenanceType: 'PREVENTIVE',
                  maintenanceFrequency: '6 Months',
                });
                setAddModalOpen(true);
              }}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-[#0066ff] px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-600 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Add Asset</span>
            </button>
          )}
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Main Assets Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                <th className="py-3.5 px-4">Asset ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching medical assets found.
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const isSelected = selectedAsset?.assetId === asset.assetId;
                  return (
                    <tr
                      key={asset.assetId}
                      onClick={() => setSelectedAsset(asset)}
                      className={`transition cursor-pointer hover:bg-slate-50/80 ${
                        isSelected ? 'bg-blue-50/50 font-medium' : ''
                      }`}
                    >
                      <td className="py-4 px-4 font-semibold text-blue-600 font-mono">
                        {asset.assetId}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {asset.assetName}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {asset.category || 'Life Support'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            asset.currentStatus === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-600'
                              : asset.currentStatus === 'UNDER_MAINTENANCE'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {asset.currentStatus === 'AVAILABLE'
                            ? 'Available'
                            : asset.currentStatus === 'UNDER_MAINTENANCE'
                            ? 'Under Maintenance'
                            : asset.currentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            asset.currentCondition === 'GOOD' || asset.currentCondition === 'EXCELLENT'
                              ? 'bg-emerald-50 text-emerald-600'
                              : asset.currentCondition === 'FAIR'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {asset.currentCondition === 'GOOD'
                            ? 'Good'
                            : asset.currentCondition === 'FAIR'
                            ? 'Fair'
                            : asset.currentCondition}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {asset.location ? `${asset.department || ''} - ${asset.location}` : 'ICU - Room 04'}
                      </td>
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewDetailsPage(asset.assetId)}
                            title="Open Full Asset Details Page"
                            className="flex items-center gap-1 rounded-lg bg-[#0066ff] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleSelectAndScroll(asset)}
                            title="Preview Below"
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                          >
                            Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50 text-xs text-slate-600">
            <span>
              Showing page <strong className="text-slate-900">{page}</strong> of{' '}
              <strong className="text-slate-900">{totalPages}</strong> ({filteredAssets.length} assets)
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

      {/* Embedded Asset Details Panel Matching Screenshot 3 */}
      {selectedAsset && (
        <div id="asset-details-section" className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm animate-fade-in scroll-mt-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-[#0a192f]">
                  Asset Details
                </h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-bold text-blue-600 border border-blue-100">
                  {selectedAsset.assetId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Currently displaying live MongoDB master record for {selectedAsset.assetName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewDetailsPage(selectedAsset.assetId)}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100 cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Open Full Lifecycle Page</span>
              </button>

              {canManage && (
                <button
                  onClick={() => handleOpenEdit(selectedAsset)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0066ff] px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-600 cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Asset</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Content Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            {/* Left: Medical Device Image Preview */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 border border-slate-100">
              <img
                src={pumpImage}
                alt={selectedAsset.assetName}
                className="h-52 w-52 object-contain drop-shadow-md transition transform hover:scale-105"
              />
              <p className="mt-3 text-xs font-bold text-slate-700">{selectedAsset.assetName}</p>
              <p className="text-[10px] text-slate-400 font-mono">{selectedAsset.serialNumber || 'SN-UNSET'}</p>
            </div>

            {/* Middle Specifications */}
            <div className="lg:col-span-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Asset ID</span>
                <span className="font-bold text-slate-800 font-mono">{selectedAsset.assetId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Asset Name</span>
                <span className="font-bold text-slate-800">{selectedAsset.assetName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Category</span>
                <span className="font-bold text-slate-800">{selectedAsset.category || 'Medical Equipment'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Asset Type</span>
                <span className="font-bold text-slate-800">{selectedAsset.assetType || 'Medical Device'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Manufacturer</span>
                <span className="font-bold text-slate-800">{selectedAsset.manufacturer || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Model</span>
                <span className="font-bold text-slate-800">{selectedAsset.model || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Serial Number</span>
                <span className="font-bold text-slate-800">{selectedAsset.serialNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Department</span>
                <span className="font-bold text-slate-800">{selectedAsset.department || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Ward / Room / Location</span>
                <span className="font-bold text-slate-800">
                  {[selectedAsset.ward, selectedAsset.room, selectedAsset.location].filter(Boolean).join(' • ') || selectedAsset.location || '—'}
                </span>
              </div>
            </div>

            {/* Right Status & Dates */}
            <div className="lg:col-span-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Purchase Date</span>
                <span className="font-bold text-slate-800">
                  {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toISOString().split('T')[0] : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Warranty Start / End</span>
                <span className="font-bold text-slate-800">
                  {selectedAsset.warrantyStartDate ? new Date(selectedAsset.warrantyStartDate).toISOString().split('T')[0] : '—'} to {selectedAsset.warrantyEndDate ? new Date(selectedAsset.warrantyEndDate).toISOString().split('T')[0] : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Maintenance Freq.</span>
                <span className="font-bold text-slate-800">{selectedAsset.maintenanceFrequency || 'QUARTERLY'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Last / Next Maint.</span>
                <span className="font-bold text-slate-800">
                  {selectedAsset.lastMaintenanceDate ? new Date(selectedAsset.lastMaintenanceDate).toISOString().split('T')[0] : 'None'} | {selectedAsset.nextMaintenanceDate ? new Date(selectedAsset.nextMaintenanceDate).toISOString().split('T')[0] : 'Scheduled'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Maintenance Type</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                  {selectedAsset.maintenanceType || 'PREVENTIVE'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Current Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    selectedAsset.currentStatus === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-600'
                      : selectedAsset.currentStatus === 'UNDER_MAINTENANCE'
                      ? 'bg-red-50 text-red-600'
                      : selectedAsset.currentStatus === 'OUT_OF_SERVICE'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedAsset.currentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Current Condition</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    selectedAsset.currentCondition === 'EXCELLENT' || selectedAsset.currentCondition === 'GOOD'
                      ? 'bg-emerald-50 text-emerald-600'
                      : selectedAsset.currentCondition === 'FAIR'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {selectedAsset.currentCondition || 'GOOD'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-500">Criticality</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    selectedAsset.criticality === 'CRITICAL' || selectedAsset.criticality === 'HIGH'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {selectedAsset.criticality || 'HIGH'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Portalled Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Asset — ${selectedAsset?.assetId}`}
        description="Update current operational properties in MongoDB."
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormField label="Asset Name" required>
            <input
              type="text"
              required
              value={formData.assetName || ''}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department" required>
              <input
                type="text"
                required
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Location" required>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Current Status" required>
              <select
                value={formData.currentStatus || 'AVAILABLE'}
                onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                className={selectClass}
              >
                <option value="AVAILABLE">Available</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
                <option value="RETIRED">Retired</option>
              </select>
            </FormField>
            <FormField label="Current Condition" required>
              <select
                value={formData.currentCondition || 'GOOD'}
                onChange={(e) => setFormData({ ...formData, currentCondition: e.target.value })}
                className={selectClass}
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Asset Portalled Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Medical Equipment"
        description="Add a new equipment master record into MongoDB."
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Asset ID" required>
              <input
                type="text"
                required
                value={formData.assetId || ''}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Asset Name" required>
              <input
                type="text"
                required
                placeholder="e.g. Infusion Pump"
                value={formData.assetName || ''}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Manufacturer" required>
              <input
                type="text"
                required
                value={formData.manufacturer || ''}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Model" required>
              <input
                type="text"
                required
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department" required>
              <input
                type="text"
                required
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Location" required>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
