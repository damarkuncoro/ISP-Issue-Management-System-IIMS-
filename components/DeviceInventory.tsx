
import React, { useState } from 'react';
import { Device, DeviceStatus, UserRole } from '../types';
import { Search, Server, Plus, CheckCircle, Clock, ShieldCheck, MapPin, Hash } from 'lucide-react';
import AddDeviceModal from './AddDeviceModal';

interface DeviceInventoryProps {
  devices: Device[];
  userRole: UserRole;
  onAddDevice: (device: any) => void;
  onValidateDevice: (id: string) => void;
}

const DeviceInventory: React.FC<DeviceInventoryProps> = ({ devices, userRole, onAddDevice, onValidateDevice }) => {
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(filterText.toLowerCase()) ||
    d.ip_address.includes(filterText) ||
    d.location.toLowerCase().includes(filterText.toLowerCase())
  );

  const canValidate = userRole === UserRole.NETWORK || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.NOC;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AddDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={onAddDevice}
        userRole={userRole}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Network Inventory</h2>
            <p className="text-slate-500">Manage routers, switches, OLTs, and infrastructure assets.</p>
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
         >
            <Plus size={20} /> Register Device
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by Hostname, IP, or Location..." 
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
                         <th className="px-6 py-4">Type & Model</th>
                         <th className="px-6 py-4">Network Details</th>
                         <th className="px-6 py-4">Location</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {filteredDevices.map(device => (
                         <tr key={device.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4">
                                 <div className="font-bold text-slate-800">{device.name}</div>
                                 <div className="text-xs text-slate-500 font-mono">SN: {device.serial_number}</div>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                     <Server size={14} className="text-slate-400" />
                                     <span className="font-medium text-slate-700">{device.type}</span>
                                 </div>
                                 <div className="text-xs text-slate-500">{device.model}</div>
                             </td>
                             <td className="px-6 py-4 font-mono text-xs">
                                 <div className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block mb-1">{device.ip_address}</div>
                                 <div className="text-slate-500">{device.mac_address}</div>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-1.5 text-slate-700">
                                     <MapPin size={14} className="text-slate-400" />
                                     {device.location}
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 {device.status === DeviceStatus.ACTIVE ? (
                                     <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                         <ShieldCheck size={12} /> Active
                                     </span>
                                 ) : (
                                     <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                         <Clock size={12} /> Pending Validation
                                     </span>
                                 )}
                                 {device.installed_by && device.status === DeviceStatus.PENDING && (
                                     <div className="text-[10px] text-slate-400 mt-1">Input by: {device.installed_by}</div>
                                 )}
                             </td>
                             <td className="px-6 py-4">
                                 {device.status === DeviceStatus.PENDING && canValidate && (
                                     <button 
                                        onClick={() => onValidateDevice(device.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded shadow-sm flex items-center gap-1 transition"
                                     >
                                         <CheckCircle size={12} /> Validate
                                     </button>
                                 )}
                                 {device.status === DeviceStatus.ACTIVE && (
                                     <button className="text-slate-400 hover:text-blue-600 transition">
                                         <Hash size={18} />
                                     </button>
                                 )}
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
    </div>
  );
};

export default DeviceInventory;
