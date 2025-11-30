
import React, { useState, useEffect } from 'react';
import { Device, DeviceStatus, UserRole, Customer, Ticket } from '../types';
import { Search, Server, Plus, CheckCircle, Clock, ShieldCheck, MapPin, Hash, Edit, Image as ImageIcon, User, Network, Eye, List, GitGraph, Upload, Grid, Map } from 'lucide-react';
import AddDeviceModal from './AddDeviceModal';
import ImportDeviceModal from './ImportDeviceModal';
import NetworkTopologyTree from './NetworkTopologyTree';
import IPAMGrid from './IPAMGrid';
import TopologyMap from './TopologyMap';

interface DeviceInventoryProps {
  devices: Device[];
  userRole: UserRole;
  customers?: Customer[]; 
  onAddDevice: (device: any) => void;
  onUpdateDevice: (id: string, device: any) => void;
  onValidateDevice: (id: string) => void;
  onSelectDevice?: (device: Device) => void;
  onNavigateToCustomer?: (customerOrId: string | Customer) => void; // Added for IPAM linking
  preSetFilter?: string; 
  tickets?: Ticket[]; // Added optional tickets for map context
}

const DeviceInventory: React.FC<DeviceInventoryProps> = ({ devices, userRole, customers = [], onAddDevice, onUpdateDevice, onValidateDevice, onSelectDevice, onNavigateToCustomer, preSetFilter, tickets = [] }) => {
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'TREE' | 'IPAM' | 'MAP'>('LIST');
  
  // Real-world subnets for PT. Cakramedia Indocyber (AS24200)
  const availableSubnets = [
    { subnet: "202.133.0", description: "Static Assignment (Corp)" },
    { subnet: "202.133.1", description: "Static Assignment (Corp)" },
    { subnet: "202.133.2", description: "Static Assignment (Corp)" },
    { subnet: "202.133.3", description: "Cakramedia Indocyber, PT." },
    { subnet: "202.133.4", description: "PT. Cakramedia Indocyber" },
    { subnet: "202.133.5", description: "Cybercafe & Office (Laguna)" },
    { subnet: "202.133.6", description: "Static Assignment (Corp)" },
    { subnet: "202.133.7", description: "Static Assignment (Corp)" }
  ];

  const [selectedSubnet, setSelectedSubnet] = useState(availableSubnets[4].subnet); // Default to .4 (Infra)

  useEffect(() => {
    if (preSetFilter) {
        setFilterText(preSetFilter);
    }
  }, [preSetFilter]);

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(filterText.toLowerCase()) ||
    d.ip_address.includes(filterText) ||
    d.location.toLowerCase().includes(filterText.toLowerCase()) ||
    d.serial_number.toLowerCase().includes(filterText.toLowerCase())
  );

  const canValidate = userRole === UserRole.NETWORK || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.NOC;
  
  const canEdit = userRole === UserRole.NETWORK || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.NOC || userRole === UserRole.MANAGER || userRole === UserRole.FIELD;

  const handleOpenAdd = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleValidateClick = (e: React.MouseEvent, device: Device) => {
      e.stopPropagation();
      setEditingDevice(device);
      setIsModalOpen(true);
  };

  const handleModalSubmit = (deviceData: any) => {
      if (editingDevice) {
          if (editingDevice.status === DeviceStatus.PENDING && canValidate) {
             onUpdateDevice(editingDevice.id, { ...deviceData, status: DeviceStatus.ACTIVE });
          } else {
             onUpdateDevice(editingDevice.id, deviceData);
          }
      } else {
          onAddDevice(deviceData);
      }
  };

  const handleBulkImport = (newDevices: any[]) => {
      newDevices.forEach(d => onAddDevice(d));
  };

  const getCustomerName = (custId?: string) => {
      if (!custId) return null;
      const c = customers.find(x => x.id === custId);
      return c ? c.name : custId;
  };

  const getUplinkName = (uplinkId?: string) => {
      if (!uplinkId) return null;
      const d = devices.find(x => x.id === uplinkId);
      return d ? d.name : uplinkId;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AddDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit} 
        onUpdate={(id, data) => handleModalSubmit(data)}
        userRole={userRole}
        device={editingDevice}
        customers={customers}
        allDevices={devices}
      />

      <ImportDeviceModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        userRole={userRole}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Inventory & Assets</h2>
            <p className="text-slate-500">Manage routers, switches, OLTs, and IPAM.</p>
         </div>
         <div className="flex gap-2">
             <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
                 <button 
                    onClick={() => setViewMode('LIST')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition ${
                        viewMode === 'LIST' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                     <List size={16} /> List
                 </button>
                 <button 
                    onClick={() => setViewMode('TREE')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition ${
                        viewMode === 'TREE' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                     <GitGraph size={16} /> Topology Tree
                 </button>
                 <button 
                    onClick={() => setViewMode('IPAM')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition ${
                        viewMode === 'IPAM' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                     <Grid size={16} /> IPAM
                 </button>
                 <button 
                    onClick={() => setViewMode('MAP')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition ${
                        viewMode === 'MAP' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                     <Map size={16} /> Map
                 </button>
             </div>

             {/* Only Technical roles can Add Devices */}
             {(canEdit || canValidate) && viewMode === 'LIST' && (
                 <>
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
                        title="Import from CSV"
                    >
                        <Upload size={20} />
                    </button>
                    <button 
                        onClick={handleOpenAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
                    >
                        <Plus size={20} /> Register Device
                    </button>
                 </>
             )}
         </div>
      </div>

      {viewMode === 'MAP' ? (
          <div className="h-[600px]">
              <TopologyMap devices={devices} tickets={tickets} />
          </div>
      ) : viewMode === 'IPAM' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                  <h4 className="font-bold text-slate-700">Select Subnet:</h4>
                  <select 
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    value={selectedSubnet}
                    onChange={(e) => setSelectedSubnet(e.target.value)}
                  >
                      {availableSubnets.map(s => (
                          <option key={s.subnet} value={s.subnet}>{s.subnet}.0/24 - {s.description}</option>
                      ))}
                  </select>
              </div>
              <IPAMGrid 
                  subnet={selectedSubnet}
                  devices={devices}
                  customers={customers}
                  onNavigateToDevice={(id) => { if(onSelectDevice) { const d = devices.find(x => x.id === id); if(d) onSelectDevice(d); } }}
                  onNavigateToCustomer={(id) => { if(onNavigateToCustomer) onNavigateToCustomer(id); }}
              />
          </div>
      ) : viewMode === 'TREE' ? (
          <NetworkTopologyTree 
            devices={devices} // Pass all devices, tree handles filtering
            onSelectDevice={onSelectDevice}
          />
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Hostname, IP, SN or Location..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                     <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active: {devices.filter(d => d.status === DeviceStatus.ACTIVE).length}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending: {devices.filter(d => d.status === DeviceStatus.PENDING).length}
                     </div>
                </div>
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
                         <tr>
                             <th className="px-6 py-4">Device Info</th>
                             <th className="px-6 py-4">Type & Uplink</th>
                             <th className="px-6 py-4">Network Details</th>
                             <th className="px-6 py-4">Location & Owner</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {filteredDevices.map(device => (
                             <tr 
                                key={device.id} 
                                className="hover:bg-slate-50 cursor-pointer"
                                onClick={() => onSelectDevice && onSelectDevice(device)}
                             >
                                 <td className="px-6 py-4">
                                     <div className="font-bold text-slate-800">{device.name}</div>
                                     <div className="text-xs text-slate-500 font-mono">SN: {device.serial_number}</div>
                                     {device.installation_photo && (
                                         <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-1">
                                            <ImageIcon size={10} /> Photo Attached
                                         </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-2 mb-1">
                                         <Server size={14} className="text-slate-400" />
                                         <span className="font-medium text-slate-700">{device.type}</span>
                                     </div>
                                     {device.uplink_device_id && (
                                         <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-purple-50 px-1.5 py-0.5 rounded w-fit">
                                             <Network size={10} className="text-purple-500"/>
                                             Uplink: {getUplinkName(device.uplink_device_id)}
                                         </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 font-mono text-xs">
                                     {device.ip_address ? (
                                        <div className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block mb-1">{device.ip_address}</div>
                                     ) : (
                                        <div className="text-slate-400 italic">--.--.--.--</div>
                                     )}
                                     <div className="text-slate-500">{device.mac_address}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-1.5 text-slate-700 mb-1">
                                         <MapPin size={14} className="text-slate-400" />
                                         {device.location}
                                     </div>
                                     {device.customer_id && (
                                         <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 w-fit px-1.5 py-0.5 rounded">
                                             <User size={10} /> {getCustomerName(device.customer_id)}
                                         </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4">
                                     {device.status === DeviceStatus.ACTIVE ? (
                                         <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                             <ShieldCheck size={12} /> Active
                                         </span>
                                     ) : (
                                         <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                             <Clock size={12} /> Pending
                                         </span>
                                     )}
                                     {device.installed_by && device.status === DeviceStatus.PENDING && (
                                         <div className="text-[10px] text-slate-400 mt-1">Tech: {device.installed_by}</div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex gap-2">
                                         {/* View Detail Button */}
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); onSelectDevice && onSelectDevice(device); }}
                                            className="text-slate-500 hover:text-blue-600 bg-slate-100 p-1.5 rounded transition"
                                            title="View Details"
                                         >
                                            <Eye size={16} />
                                         </button>

                                         {device.status === DeviceStatus.PENDING && canValidate && (
                                             <button 
                                                onClick={(e) => handleValidateClick(e, device)}
                                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded shadow-sm flex items-center gap-1 transition"
                                             >
                                                 <CheckCircle size={12} /> Review
                                             </button>
                                         )}
                                         
                                         {canEdit && (
                                             <button 
                                                onClick={(e) => handleOpenEdit(e, device)}
                                                className="text-slate-500 hover:text-blue-600 bg-slate-100 p-1.5 rounded transition"
                                                title="Edit Device"
                                             >
                                                <Edit size={16} />
                                             </button>
                                         )}
                                     </div>
                                 </td>
                             </tr>
                         ))}
                         {filteredDevices.length === 0 && (
                             <tr>
                                 <td colSpan={6} className="text-center py-8 text-slate-500">
                                     No devices found.
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>
      )}
    </div>
  );
};

export default DeviceInventory;
