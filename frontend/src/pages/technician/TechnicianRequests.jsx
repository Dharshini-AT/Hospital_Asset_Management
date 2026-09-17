import {useEffect,useState} from 'react';
import {Wrench} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import MaintenanceTable from '../common/MaintenanceTable';
import {Alert,LoadingBlock} from '../../components/common/Feedback';
import {maintenanceService} from '../../services/dataService';
const TechnicianRequests=()=>{const[d,setD]=useState([]);const[l,setL]=useState(true);const[e,setE]=useState('');useEffect(()=>{maintenanceService.list({page:1,limit:100}).then(x=>setD(x?.requests||[])).catch(x=>setE(x.response?.data?.message||'Unable to load assigned requests.')).finally(()=>setL(false))},[]);if(l)return <LoadingBlock text="Loading assigned work..."/>;return <div className="animate-fade-in"><PageHeader title="Assigned Requests" description="Open a request to start maintenance or record the completed service details." icon={Wrench}/>{e&&<div className="mb-4"><Alert>{e}</Alert></div>}<MaintenanceTable requests={d} basePath="/technician/requests"/></div>};export default TechnicianRequests;
