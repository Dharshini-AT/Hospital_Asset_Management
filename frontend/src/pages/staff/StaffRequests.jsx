import {useEffect,useState} from 'react';
import {ClipboardList} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MaintenanceTable from '../common/MaintenanceTable';
import {Alert,LoadingBlock} from '../../components/common/Feedback';
import {maintenanceService} from '../../services/dataService';
const StaffRequests=()=>{const[d,setD]=useState([]);const[l,setL]=useState(true);const[e,setE]=useState('');useEffect(()=>{maintenanceService.list({page:1,limit:100}).then(x=>setD(x?.requests||[])).catch(x=>setE(x.response?.data?.message||'Unable to load requests.')).finally(()=>setL(false))},[]);if(l)return <LoadingBlock text="Loading your maintenance requests..."/>;return <div className="animate-fade-in"><PageHeader title="My Maintenance Requests" description="Track the same request from reported issue through technician assignment and completion." icon={ClipboardList}/>{e&&<div className="mb-4"><Alert>{e}</Alert></div>}<MaintenanceTable requests={d} basePath="/staff/requests"/></div>};export default StaffRequests;
