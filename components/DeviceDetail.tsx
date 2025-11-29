
import React, { useState } from 'react';
import { Device, DeviceStatus, Ticket, UserRole, Customer } from '../types';
import { ArrowLeft, Server, MapPin, Shield, Activity, Network, Users, Ticket as TicketIcon, Edit, Clock, Settings, CheckCircle, Boxes } from 'lucide-react';
import LiveTrafficChart from './LiveTrafficChart';
import AddDeviceModal from './AddDeviceModal';

interface DeviceDetailProps {
  device: Device;
  allDevices: Device[];
  tickets: Ticket[];
  customers: Customer[]; // To verify customer names if needed
  userRole: UserRole;
  onBack: () => void;
  onUpdateDevice: (id: string, data: any) => void;
  onNavigateToTicket: (ticket: Ticket) => void;
  onNavigateToDevice: (deviceId: string) => void;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ 
    device, 
    allDevices, 
    tickets, 
    customers,
    userRole, 
    onBack, 
    onUpdateDevice,
    onNavigateToTicket,
    onNavigateToDevice
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'topology' | 'history' | 'pon_ports'>('overview');

  // Logic
  const connectedDownstream = allDevices.filter(d => d.uplink_device_id === device.id);
  const deviceTickets = tickets.filter(t => t.device_id === device.id);
  const parentDevice = allDevices.find(d => d.id === device.uplink_device_id);
  const linkedCustomer = customers.find(c => c.id === device.customer_id);

  const isOLT = device.type === 'OLT';

  const canEdit = userRole === UserRole.NETWORK || userRole === UserRole.NOC || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.MANAGER;

  const handleUpdate = (data: any) => {
      onUpdateDevice(device.id, data);
      setIsEditModalOpen(false);
  };

  // Helper for OLT PON Viz
  const getPonPorts = () => {
    const ports = [];
    const maxPorts = 8; // Simulate 8 port OLT card
    
    // Find all connected ONUs
    const onus = allDevices.filter(d => d.uplink_device_id === device.id);
    
    for (let i = 1; i <= maxPorts; i++) {
        const portName = `PON-${i}`;
        // Find ONUs on this port by checking linked customer's olt_port string or simulation
        const connected = onus.filter(onu => {
            const cust = customers.find(c => c.id === onu.customer_id);
            return cust?.olt_port?.includes(portName);
        });
        
        ports.push({
            id: i,
            name: portName,
            connectedCount: connected.length,
            onus: connected,
            capacity: 64 // Max per PON
        });
    }
    return ports;
  };

  const ponPorts = isOLT ? getPonPorts() : [];

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      {/* Edit Modal */}
      {isEditModalOpen && (
          <AddDeviceModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={() => {}} // Not used for edit
            onUpdate={(id, data) => handleUpdate(data)}
            userRole={userRole}
            device={device}
            allDevices={allDevices}
            customers={customers}
          />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">{device.name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                device.status === DeviceStatus.ACTIVE ? 'bg-green-100 text-green-700 border-green-200' : 
                device.status === DeviceStatus.PENDING ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-red-100 text-red-700 border-red-200'
            }`}>
              {device.status}
            </span>
          </div>
          <p className="text-slate-500 font-mono text-sm">{device.ip_address || 'No IP'} • {device.mac_address}</p>
        </div>
        {canEdit && (
            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-medium"
            >
                <Edit size={16} /> Configure
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
          {['overview', 'traffic', 'topology', isOLT ? 'pon_ports' : null, 'history'].filter(Boolean).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition capitalize whitespace-nowrap ${
                    activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                 {tab?.replace('_', ' ')}
              </button>
          ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <Server size={18} className="text-indigo-500" /> Device Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                              <p className="text-xs text-slate-500 uppercase">Model / Hardware</p>
                              <p className="font-medium text-slate-800">{device.model}</p>
                          </div>
                          <div>
                              <p className="text-xs text-slate-500 uppercase">Type</p>
                              <p className="font-medium text-slate-800">{device.type}</p>
                          </div>
                          <div>
                              <p className="text-xs text-slate-500 uppercase">Serial Number</p>
                              <p className="font-mono text-slate-700">{device.serial_number}</p>
                          </div>
                          <div>
                              <p className="text-xs text-slate-500 uppercase">Installation Date</p>
                              <p className="font-medium text-slate-800">{new Date(device.last_updated).toLocaleDateString()}</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <MapPin size={18} className="text-red-500" /> Location & Ownership
                      </h4>
                      <div className="space-y-4">
                          <div>
                              <p className="text-xs text-slate-500 uppercase">Physical Location</p>
                              <p className="font-medium text-slate-800 text-lg">{device.location}</p>
                          </div>
                          {linkedCustomer && (
                              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition">
                                  <div className="bg-green-100 p-2 rounded text-green-600"><Users size={20} /></div>
                                  <div>
                                      <p className="text-xs text-slate-500 font-bold uppercase">Customer Device (CPE)</p>
                                      <p className="font-bold text-slate-800">{linkedCustomer.name}</p>
                                      <p className="text-xs text-slate-500">{linkedCustomer.id}</p>
                                  </div>
                              </div>
                          )}
                          {parentDevice && (
                              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => onNavigateToDevice(parentDevice.id)}>
                                  <div className="bg-purple-100 p-2 rounded text-purple-600"><Network size={20} /></div>
                                  <div>
                                      <p className="text-xs text-slate-500 font-bold uppercase">Uplink (Parent)</p>
                                      <p className="font-bold text-slate-800">{parentDevice.name}</p>
                                      <p className="text-xs text-slate-500">{parentDevice.ip_address}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <Activity size={18} className="text-blue-500" /> Status
                      </h4>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Uptime</span>
                              <span className="font-mono font-medium text-slate-800">45d 12h 30m</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">CPU Load</span>
                              <span className="font-mono font-medium text-green-600">12%</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Memory</span>
                              <span className="font-mono font-medium text-blue-600">450MB / 1GB</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Temperature</span>
                              <span className="font-mono font-medium text-slate-800">42°C</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Management</h4>
                      <div className="space-y-2">
                          <button className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2">
                              <Settings size={14} /> Web Config (Remote)
                          </button>
                          <button className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2">
                              <Activity size={14} /> Ping Test
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* TRAFFIC TAB */}
      {activeTab === 'traffic' && (
          <div className="animate-in fade-in">
              <LiveTrafficChart deviceName={device.name} />
          </div>
      )}

      {/* PON PORTS TAB (OLT ONLY) */}
      {activeTab === 'pon_ports' && isOLT && (
          <div className="animate-in fade-in space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                      <Boxes size={18} className="text-orange-500" /> GPON Line Card Status
                  </h4>
                  
                  {/* Ports Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ponPorts.map(port => {
                          const percent = (port.connectedCount / port.capacity) * 100;
                          const color = percent > 90 ? 'bg-red-100 border-red-300' : percent > 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-green-100 border-green-300';
                          const dotColor = percent > 90 ? 'bg-red-500' : percent > 50 ? 'bg-yellow-500' : 'bg-green-500';

                          return (
                              <div key={port.id} className={`p-4 rounded-xl border ${color} relative group`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="font-bold text-slate-700">{port.name}</span>
                                      <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
                                  </div>
                                  <div className="text-xs text-slate-600 mb-2">
                                      {port.connectedCount} / {port.capacity} ONUs
                                  </div>
                                  <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
                                      <div className={`h-full ${dotColor}`} style={{ width: `${percent}%` }}></div>
                                  </div>
                                  
                                  {/* Tooltip List of ONUs */}
                                  {port.onus.length > 0 && (
                                      <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-10 p-2 max-h-48 overflow-y-auto">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Connected Clients</p>
                                          {port.onus.map(o => (
                                              <div 
                                                key={o.id} 
                                                className="text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer"
                                                onClick={() => onNavigateToDevice(o.id)}
                                              >
                                                  <div className="font-medium text-slate-800">{o.name}</div>
                                                  <div className="text-[10px] text-slate-500">{o.ip_address}</div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* TOPOLOGY TAB */}
      {activeTab === 'topology' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
              <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <Network size={18} className="text-purple-600" /> Downstream Connected Devices
              </h4>
              
              {connectedDownstream.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                      <Network size={32} className="mx-auto text-slate-300 mb-2" />
                      <p>No devices are currently connected downstream from this unit.</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                  <th className="px-6 py-3">Device Name</th>
                                  <th className="px-6 py-3">Type</th>
                                  <th className="px-6 py-3">IP Address</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {connectedDownstream.map(downstream => (
                                  <tr key={downstream.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 font-medium text-slate-800">{downstream.name}</td>
                                      <td className="px-6 py-4">{downstream.type}</td>
                                      <td className="px-6 py-4 font-mono text-xs">{downstream.ip_address}</td>
                                      <td className="px-6 py-4">
                                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                              downstream.status === DeviceStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                              {downstream.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <button 
                                            onClick={() => onNavigateToDevice(downstream.id)}
                                            className="text-blue-600 hover:underline text-xs"
                                          >
                                              View
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
              <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <TicketIcon size={18} className="text-orange-600" /> Incident History
              </h4>
              
              {deviceTickets.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                      <CheckCircle size={32} className="mx-auto text-green-300 mb-2" />
                      <p>No incidents reported for this device.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {deviceTickets.map(ticket => (
                          <div key={ticket.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer flex justify-between items-center" onClick={() => onNavigateToTicket(ticket)}>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          ticket.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                      }`}>{ticket.severity}</span>
                                      <span className="font-mono text-xs text-slate-500">{ticket.id}</span>
                                  </div>
                                  <h5 className="font-bold text-slate-800 text-sm">{ticket.title}</h5>
                                  <p className="text-xs text-slate-500 mt-1">Resolved on: {new Date(ticket.sla_deadline).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                  <span className="text-xs font-medium text-slate-600 block">{ticket.status}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

    </div>
  );
};

export default DeviceDetail;
