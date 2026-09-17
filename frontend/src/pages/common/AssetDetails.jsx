import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, MapPin, Package, ShieldCheck, Wrench } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import AssetHistoryTimeline from '../../components/assets/AssetHistoryTimeline';
import Button from '../../components/common/Button';
import SectionCard from '../../components/common/SectionCard';
import { Alert, LoadingBlock } from '../../components/common/Feedback';
import { assetService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const fmt = v => v ? new Date(v).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const AssetDetails = () => {
  const { assetId } = useParams(); const navigate = useNavigate(); const { user } = useAuth();
  const [asset,setAsset]=useState(null); const [history,setHistory]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const load=async()=>{try{setLoading(true);const [a,h]=await Promise.all([assetService.get(assetId),assetService.history(assetId)]);setAsset(a);setHistory(Array.isArray(h)?h:[]);}catch(e){setError(e.response?.data?.message||'Unable to load asset details.')}finally{setLoading(false)}};
  useEffect(()=>{load()},[assetId]);
  if(loading)return <LoadingBlock text="Loading asset details..."/>;
  if(error||!asset)return <Alert>{error||'Asset not found.'}</Alert>;
  const back=`/${user.role.toLowerCase()}/assets`;
  return <div className="animate-fade-in"><PageHeader title={`${asset.assetId} • ${asset.assetName}`} description="Complete current state, lifecycle information and permanent maintenance traceability." icon={Package} breadcrumbs={[{label:'Assets',path:back},{label:asset.assetId}]} action={<div className="flex gap-2">{user.role==='ADMIN'&&<Button variant="outline" onClick={()=>navigate(`/admin/assets/${asset.assetId}/edit`)}>Edit Asset</Button>}<Button variant="outline" onClick={()=>navigate(back)} icon={ArrowLeft}>Back to Assets</Button></div>}/>
    <div className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
      <div className="space-y-5">
        <SectionCard title="Asset Overview" subtitle="Current operational information"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Info icon={ShieldCheck} label="Status" value={<StatusBadge status={asset.currentStatus}/>}/><Info label="Condition" value={asset.currentCondition}/><Info label="Criticality" value={asset.criticality}/><Info icon={MapPin} label="Location" value={asset.location}/></div></SectionCard>
        <SectionCard title="Asset Information" subtitle="Master record maintained by the administrator"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[['Asset ID',asset.assetId],['Asset Type',asset.assetType],['Category',asset.category],['Manufacturer',asset.manufacturer],['Model',asset.model],['Serial Number',asset.serialNumber],['Supplier',asset.supplier],['Department',asset.department],['Ward',asset.ward],['Room',asset.room],['Purchase Date',fmt(asset.purchaseDate)],['Installation Date',fmt(asset.installationDate)],['Purchase Cost',`₹${Number(asset.purchaseCost||0).toLocaleString('en-IN')}`]].map(([l,v])=><div key={l}><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{l}</p><p className="mt-1 text-xs font-semibold text-slate-700">{v||'—'}</p></div>)}</div></SectionCard>
        <SectionCard title="Maintenance Schedule" subtitle="Preventive maintenance and warranty tracking"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Info icon={CalendarDays} label="Last Maintenance" value={fmt(asset.lastMaintenanceDate)}/><Info icon={CalendarDays} label="Next Maintenance" value={fmt(asset.nextMaintenanceDate)}/><Info label="Frequency" value={asset.maintenanceFrequency}/><Info label="Warranty Ends" value={fmt(asset.warrantyEndDate)}/></div></SectionCard>
        <AssetHistoryTimeline history={history}/>
      </div>
      <div className="space-y-5"><SectionCard title="Maintenance Snapshot" subtitle="Aggregated history for this asset"><div className="space-y-4">{[['Completed services',asset.maintenanceStats?.totalMaintenanceCount||0],['Total downtime',`${asset.maintenanceStats?.totalDowntime||0} hours`],['Maintenance cost',`₹${Number(asset.maintenanceStats?.totalCost||0).toLocaleString('en-IN')}`]].map(([l,v])=><div key={l} className="rounded-xl bg-slate-50 p-4"><p className="text-[9px] uppercase tracking-wider text-slate-400">{l}</p><p className="mt-1 text-xl font-bold text-[#09284d]">{v}</p></div>)}</div></SectionCard>
      <SectionCard title="Current Maintenance Request" subtitle="The same request stays linked to the asset throughout its lifecycle">{asset.activeRequest?<div className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm font-bold text-blue-600">{asset.activeRequest.requestId}</span><StatusBadge status={asset.activeRequest.status}/></div><p className="text-xs text-slate-600">{asset.activeRequest.issueDescription}</p><div className="grid grid-cols-2 gap-3"><Info label="Priority" value={asset.activeRequest.priority}/><Info label="Reported" value={fmt(asset.activeRequest.reportedAt)}/></div></div>:<div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">No active maintenance request. Asset is available for normal operation.</div>}</SectionCard>
      {asset.description && <SectionCard title="Description"><p className="text-xs leading-6 text-slate-600">{asset.description}</p></SectionCard>}
      </div>
    </div></div>;
};
const Info=({icon:Icon,label,value})=><div className="min-w-0">{Icon&&<Icon size={15} className="mb-2 text-blue-500"/>}<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><div className="mt-1 text-xs font-semibold text-slate-700">{value||'—'}</div></div>;
export default AssetDetails;
