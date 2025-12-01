import React, { useState, useEffect } from 'react';
import { Device, DeviceStatus, Ticket, UserRole, Customer, DeviceType, Invoice, Maintenance } from '../types';
import { ArrowLeft, Server, MapPin, Shield, Activity, Network, Users, Ticket as TicketIcon, Edit, Clock, Settings, CheckCircle, Boxes, Terminal, Box, ChevronRight, X, Play, Zap, Power, RotateCcw, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LiveTrafficChart from './LiveTrafficChart';
import AddDeviceModal from './AddDeviceModal';
import CreateTicketModal from './CreateTicketModal';
import WebTerminal from './WebTerminal';
import NetworkTopologyTree from './NetworkTopologyTree';
import OpticalChart from './OpticalChart';

interface DeviceDetailProps {
  device: Device;
  allDevices: Device[];
  tickets: Ticket[];
  customers: Customer[]; // To verify customer names if needed
  invoices?: Invoice[];
  maintenance?: Maintenance[];
  userRole: UserRole;
  onBack: () => void;
  onUpdateDevice: (id: string, data: any) => void;
  onNavigateToTicket: (ticket: Ticket) => void;
  onNavigateToDevice: (deviceId: string) => void;
  onCreateTicket?: (ticketData: any) => void;
}

interface PonPort {
    id: number;
    name: string;
    adminStatus: 'UP' | 'DOWN';
    operStatus: 'UP' | 'DOWN';
    moduleType: string;
    txPower: string;
    connectedCount: number;
    children: Device[];
    capacity: number;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ 
    device, 
    allDevices, 
    tickets, 
    customers,
    invoices = [],
    maintenance = [],
    userRole, 
    onBack, 
    onUpdateDevice,
    onNavigateToTicket,
    onNavigateToDevice,
    onCreateTicket
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'topology' | 'history' | 'pon_ports' | 'terminal' | 'odp_ports' | 'optical'>('overview');
  
  // OLT Port State for Management Simulation
  const [localPonPorts, setLocalPonPorts] = useState<PonPort[]>([]);

  // Logic
  const connectedDownstream = allDevices.filter(d => d.uplink_device_id === device.id);
  const deviceTickets = tickets.filter(t => t.device_id === device.id);
  const parentDevice = allDevices.find(d => d.id === device.uplink_device_id);
  const linkedCustomer = customers.find(c => c.id === device.customer_id);

  const isOLT = device.type === DeviceType.OLT;
  const isONU = device.type === DeviceType.ONU;
  const isODP = device.type === DeviceType.ODP;
  const isPassive = isODP || device.type === DeviceType.ODC;
  const hasOptical = isOLT || isONU;

  const canEdit = userRole === UserRole.NETWORK || userRole === UserRole.NOC || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.MANAGER;
  
  // Only Network Engineers and NOC can access the CLI (Active Devices Only)
  const canAccessTerminal = !isPassive && (userRole === UserRole.NETWORK || userRole === UserRole.NOC || userRole === UserRole.MANAGER);

  // Initial Data Generation for OLT Ports
  useEffect(() => {
      if (isOLT) {
        const ports: PonPort[] = [];
        const maxPorts = 8; // Simulate 8 port OLT card
        
        const directChildren = allDevices.filter(d => d.uplink_device_id === device.id);
        
        for (let i = 1; i <= maxPorts; i++) {
            const portName = `PON-${i}`;
            const connected = directChildren.filter(child => {
                const cust = customers.find(c => c.id === child.customer_id);
                // Simple heuristic matching for demo
                return (cust?.olt_port?.includes(portName)) || (child.type === DeviceType.ODP && (i % 2 === 0)); 
            });
            
            // Simulate states
            const isAdminUp = i !== 6; // Mock port 6 as shutdown
            const isOperUp = isAdminUp && connected.length > 0;
    
            ports.push({
                id: i,
                name: portName,
                adminStatus: isAdminUp ? 'UP' : 'DOWN',
                operStatus: isOperUp ? 'UP' : 'DOWN',
                moduleType: 'Class C+',
                txPower: isAdminUp ? (Math.random() * 2 + 3).toFixed(2) : '0.00', // 3-5 dBm
                connectedCount: connected.length,
                children: connected,
                capacity: 64 // Max per PON
            });
        }
        setLocalPonPorts(ports);
      }
  }, [device.id, isOLT, allDevices, customers]);

  const handleUpdate = (data: any) => {
      onUpdateDevice(device.id, data);
      setIsEditModalOpen(false);
  };

  const handleTicketSubmit = (data: any) => {
      if (onCreateTicket) onCreateTicket(data);
      setIsTicketModalOpen(false);
  };

  const handlePortAction = (portId: number, action: string) => {
      if (action === 'Shutdown' || action === 'No Shutdown') {
          setLocalPonPorts(prev => prev.map(p => {
              if (p.id === portId) {
                  const newAdminStatus = action === 'Shutdown' ? 'DOWN' : 'UP';
                  return {
                      ...p,
                      adminStatus: newAdminStatus,
                      // If admin down, oper is down. If admin up, oper depends on connections (simplified)
                      operStatus: newAdminStatus === 'DOWN' ? 'DOWN' : (p.connectedCount > 0 ? 'UP' : 'DOWN'),
                      txPower: newAdminStatus === 'DOWN' ? '0.00' : (Math.random() * 2 + 3).toFixed(2)
                  };
              }
              return p;
          }));
      } else if (action === 'Reset') {
          // Simulate reset flash
          const oldStatus = localPonPorts.find(p => p.id === portId)?.operStatus;
          setLocalPonPorts(prev => prev.map(p => p.id === portId ? { ...p, operStatus: 'DOWN' } : p));
          setTimeout(() => {
              setLocalPonPorts(prev => prev.map(p => p.id === portId ? { ...p, operStatus: oldStatus || 'DOWN' } : p));
          }, 1000);
      }
  };

  // Upstream Trace
  const getUpstreamPath = (startDevice: Device): Device[] => {
      const path: Device[] = [];
      let curr: Device | undefined = startDevice;
      while (curr && curr.uplink_device_id) {
          const parent = allDevices.find(d => d.id === curr!.uplink_device_id);
          if (parent) {
              path.unshift(parent);
              curr = parent;
          } else {
              break;
          }
      }
      return path;
  };
  const upstreamPath = getUpstreamPath(device);

  // Generate Mock Optical Data
  const generateOpticalData = () => {
      const data = [];
      const now = new Date();
      // Generate 24 hours of data
      for (let i = 24; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 3600000); // Hourly
          // Randomize around -22 for Rx, 2.5 for Tx
          data.push({
              time: time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              rx: -22 + (Math.random() * 2 - 1),
              tx: 2.5 + (Math.random() * 0.5 - 0.25),
              temp: 45 + Math.random() * 5,
              voltage: 3.3 + (Math.random() * 0.1 - 0.05)
          });
      }
      return data;
  };
  
  // Memoize data to avoid refresh on render in real app, simplified here
  const opticalData = hasOptical ? generateOpticalData() : [];

  // Generate Mock PON History Data for OLT
  const generatePonHistory = () => {
      const history = [];
      const now = new Date();
      for (let i = 24; i >= 0; i--) {
          const t = new Date(now.getTime() - i * 3600000);
          history.push({
              time: t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              'PON-1': Math.floor(Math.random() * 800) + 200,
              'PON-2': Math.floor(Math.random() * 600) + 100,
              'PON-3': Math.floor(Math.random() * 400) + 50,
              'PON-4': Math.floor(Math.random() * 1200) + 400,
          });
      }
      return history;
  };
  const ponHistory = isOLT ? generatePonHistory() : [];

  // Calculate aggregates for OLT Summary
  const totalThroughput = ponHistory.length > 0 
      ? (ponHistory[ponHistory.length - 1]['PON-1'] + ponHistory[ponHistory.length - 1]['PON-2'] + ponHistory[ponHistory.length - 1]['PON-3'] + ponHistory[ponHistory.length - 1]['PON-4']) 
      : 0;
  const totalOnus = localPonPorts.reduce((acc, curr) => acc + curr.connectedCount, 0);
  const activePortsCount = localPonPorts.filter(p => p.operStatus === 'UP').length;

  // --- PING MODAL COMPONENT ---
  const PingModal = () => {
      const [pingLogs, setPingLogs] = useState<string[]>([]);
      const [pingStatus, setPingStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETE'>('IDLE');

      const runPing = async () => {
          setPingStatus('RUNNING');
          setPingLogs([`Pinging ${device.ip_address} with 32 bytes of data:`]);
          
          for (let i = 0; i < 4; i++) {
              await new Promise(r => setTimeout(r, 800));
              const time = Math.floor(Math.random() * 10 + 2);
              setPingLogs(prev => [...prev, `Reply from ${device.ip_address}: bytes=32 time=${time}ms TTL=64`]);
          }
          await new Promise(r => setTimeout(r, 500));
          setPingLogs(prev => [...prev, '', `Ping statistics for ${device.ip_address}:`, '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)']);
          setPingStatus('COMPLETE');
      };

      if (!isPingModalOpen) return null;

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <Activity size={18} className="text-blue-600" /> Diagnostic Tool
                      </h4>
                      <button onClick={() => setIsPingModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="p-4 bg-slate-900 h-64 overflow-y-auto font-mono text-xs text-green-400">
                      {pingLogs.length === 0 && <span className="text-slate-500">Ready to start...</span>}
                      {pingLogs.map((log, i) => <div key={i}>{log}</div>)}
                  </div>
                  <div className="p-4 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={runPing} 
                        disabled={pingStatus === 'RUNNING'}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                      >
                          <Play size={16} /> {pingStatus === 'RUNNING' ? 'Pinging...' : 'Start Ping'}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      <PingModal />

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

      {/* Create Ticket Modal */}
      {isTicketModalOpen && onCreateTicket && (
          <CreateTicketModal 
            isOpen={isTicketModalOpen}
            onClose={() => setIsTicketModalOpen(false)}
            onSubmit={handleTicketSubmit}
            customers={customers}
            devices={allDevices}
            invoices={invoices}
            maintenance={maintenance}
            preSelectedDevice={device}
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
          <p className="text-slate-500 font-mono text-sm">{device.ip_address || 'Passive Device'} • {device.serial_number}</p>
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
          {['overview', !isPassive ? 'traffic' : null, hasOptical ? 'optical' : null, 'topology', isOLT ? 'pon_ports' : null, isODP ? 'odp_ports' : null, 'history', canAccessTerminal ? 'terminal' : null].filter(Boolean).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition capitalize whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                 {tab === 'terminal' && <Terminal size={14} />}
                 {tab === 'optical' && <Zap size={14} />}
                 {tab?.replace('_', ' ')}
              </button>
          ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                  
                  {/* NETWORK POSITION CARD */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-6">
                          <h4 className="font-bold text-slate-700 flex items-center gap-2">
                              <Network size={18} className="text-blue-500" /> Network Position
                          </h4>
                          <button 
                              onClick={() => setActiveTab('topology')}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                          >
                              View Topology Map <ChevronRight size={12} />
                          </button>
                      </div>
                      
                      <div className="flex items-center justify-around relative py-2">
                          {/* Connection Line */}
                          <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-slate-200 -z-0 transform -translate-y-6"></div>

                          {/* UPLINK */}
                          <div 
                              className={`relative z-10 flex flex-col items-center gap-2 group ${parentDevice ? 'cursor-pointer' : ''}`}
                              onClick={() => parentDevice && onNavigateToDevice(parentDevice.id)}
                          >
                               <div className={`w-14 h-14 flex items-center justify-center rounded-full border-4 transition-all duration-200 shadow-sm ${
                                   parentDevice 
                                   ? 'bg-white border-slate-200 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-600' 
                                   : 'bg-slate-50 border-slate-100 text-slate-300'
                               }`}>
                                   <Server size={20} />
                               </div>
                               <div className="text-center bg-white px-2 relative">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Uplink</p>
                                   <p className="text-xs font-bold text-slate-800 max-w-[100px] truncate leading-tight">
                                      {parentDevice ? parentDevice.name : 'Core / Root'}
                                   </p>
                                   {parentDevice && <p className="text-[9px] text-slate-500 font-mono mt-0.5">{parentDevice.ip_address}</p>}
                               </div>
                          </div>

                          {/* CURRENT */}
                          <div className="relative z-10 flex flex-col items-center gap-2 -mt-4">
                               <div className="w-20 h-20 flex items-center justify-center rounded-full border-4 border-blue-100 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl ring-4 ring-white">
                                   {isOLT ? <Server size={32} /> : <Server size={32} />} 
                               </div>
                               <div className="text-center bg-white px-3 relative mt-1">
                                   <span className="inline-block text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mb-1">THIS DEVICE</span>
                                   <p className="text-sm font-bold text-slate-900 leading-tight">{device.name}</p>
                                   <p className="text-xs text-slate-500 font-mono mt-0.5">{device.ip_address || 'Passive'}</p>
                               </div>
                          </div>

                          {/* DOWNSTREAM */}
                          <div className="relative z-10 flex flex-col items-center gap-2">
                               <div className="w-14 h-14 flex items-center justify-center rounded-full border-4 border-slate-200 bg-white text-slate-600 shadow-sm">
                                   <div className="relative">
                                      <Users size={20} />
                                      {connectedDownstream.length > 0 && (
                                        <span className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                            {connectedDownstream.length}
                                        </span>
                                      )}
                                   </div>
                               </div>
                               <div className="text-center bg-white px-2 relative">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Downstream</p>
                                   <p className="text-xs font-bold text-slate-800 leading-tight">Connected Peers</p>
                                   <p className="text-[9px] text-slate-500 mt-0.5">{connectedDownstream.length} Devices</p>
                               </div>
                          </div>
                      </div>
                  </div>

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
                          {device.port_capacity && (
                              <div>
                                  <p className="text-xs text-slate-500 uppercase">Capacity</p>
                                  <p className="font-medium text-slate-800">{device.port_capacity} Ports</p>
                              </div>
                          )}
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
                                      <p className="text-xs text-slate-500">{parentDevice.ip_address || parentDevice.location}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  {isPassive ? (
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                              <Box size={18} className="text-purple-500" /> Port Utilization
                          </h4>
                          <div className="text-center py-6">
                              <div className="text-4xl font-bold text-slate-800 mb-1">
                                  {connectedDownstream.length} <span className="text-xl text-slate-400 font-normal">/ {device.port_capacity || 8}</span>
                              </div>
                              <p className="text-xs text-slate-500 uppercase">Ports Occupied</p>
                              <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${(connectedDownstream.length / (device.port_capacity || 8)) * 100}%` }}
                                  ></div>
                              </div>
                          </div>
                      </div>
                  ) : (
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
                  )}
                  
                  {/* Quick Actions */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Management</h4>
                      <div className="space-y-2">
                          {!isPassive && (
                              <>
                                <button className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2">
                                    <Settings size={14} /> Web Config (Remote)
                                </button>
                                <button 
                                    onClick={() => setIsPingModalOpen(true)}
                                    className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2"
                                >
                                    <Activity size={14} /> Ping Test
                                </button>
                              </>
                          )}
                          <button 
                            onClick={() => setIsTicketModalOpen(true)}
                            className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2"
                          >
                              <TicketIcon size={14} /> Report Issue
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

      {/* OPTICAL TAB */}
      {activeTab === 'optical' && hasOptical && (
          <div className="animate-in fade-in">
              <OpticalChart data={opticalData} />
          </div>
      )}

      {/* ODP PORTS TAB */}
      {activeTab === 'odp_ports' && isODP && (
          <div className="animate-in fade-in bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <Box size={18} className="text-purple-600" /> ODP Port Map
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {Array.from({ length: device.port_capacity || 8 }).map((_, idx) => {
                      const portNum = idx + 1;
                      const connectedDevice = connectedDownstream[idx]; // Mock mapping by index
                      
                      return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg border flex flex-col items-center justify-center aspect-square transition ${
                                connectedDevice 
                                ? 'bg-green-50 border-green-300 cursor-pointer hover:bg-green-100' 
                                : 'bg-slate-50 border-slate-200 opacity-50'
                            }`}
                            onClick={() => connectedDevice && onNavigateToDevice(connectedDevice.id)}
                          >
                              <span className="text-xs font-bold text-slate-400 mb-1">{portNum}</span>
                              {connectedDevice ? (
                                  <>
                                    <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                                    <span className="text-[10px] text-green-700 font-medium truncate w-full text-center">{connectedDevice.name}</span>
                                  </>
                              ) : (
                                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* PON PORTS TAB (OLT ONLY) */}
      {activeTab === 'pon_ports' && isOLT && (
          <div className="animate-in fade-in space-y-6">
              
              {/* OLT CAPACITY SUMMARY SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase">Total Throughput</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{totalThroughput} <span className="text-sm font-normal text-slate-500">Mbps</span></p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase">Connected ONUs</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{totalOnus} <span className="text-sm font-normal text-slate-500">Clients</span></p>
                  </div>
                   <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <p className="text-xs font-bold text-purple-600 uppercase">Active PON Ports</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{activePortsCount} <span className="text-sm font-normal text-slate-500">/ {localPonPorts.length}</span></p>
                  </div>
                   <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <p className="text-xs font-bold text-orange-600 uppercase">Optical Health</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">Good <span className="text-sm font-normal text-slate-500">(Avg -19dBm)</span></p>
                  </div>
              </div>

              {/* UTILIZATION CHART */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                      <Activity size={18} className="text-blue-500" /> PON Port Utilization (Throughput History)
                  </h4>
                  <div className="h-72 w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ponHistory}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="time" tick={{fontSize: 10, fill: '#64748b'}} interval={3} />
                              <YAxis label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} tick={{fontSize: 10, fill: '#64748b'}} />
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                              <Line type="monotone" dataKey="PON-1" stroke="#3b82f6" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="PON-2" stroke="#10b981" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="PON-3" stroke="#f59e0b" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="PON-4" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* PORTS GRID */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                      <Boxes size={18} className="text-orange-500" /> GPON Line Card Status & Management
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {localPonPorts.map(port => {
                          const percent = (port.connectedCount / port.capacity) * 100;
                          const isDisabled = port.adminStatus === 'DOWN';
                          const isAlarm = port.operStatus === 'DOWN' && port.adminStatus === 'UP';
                          
                          let color = 'bg-white border-slate-200';
                          if (isDisabled) color = 'bg-slate-50 border-slate-300 opacity-70';
                          else if (isAlarm) color = 'bg-red-50 border-red-200';
                          else if (percent > 90) color = 'bg-orange-50 border-orange-200';
                          else color = 'bg-white border-green-200';

                          return (
                              <div key={port.id} className={`p-4 rounded-xl border ${color} relative group transition-all hover:shadow-md`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <span className="font-bold text-slate-800 block">{port.name}</span>
                                          <span className="text-[10px] text-slate-500">{port.moduleType}</span>
                                      </div>
                                      <div className="flex gap-1">
                                          {isDisabled ? (
                                              <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded">DISABLED</span>
                                          ) : (
                                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${port.operStatus === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                  {port.operStatus}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                                  
                                  {/* Stats */}
                                  <div className="flex justify-between items-center text-xs mb-2">
                                      <span className="text-slate-600 font-medium">{port.connectedCount} / {port.capacity} ONUs</span>
                                      <span className="font-mono text-slate-500 text-[10px]">{port.txPower} dBm</span>
                                  </div>
                                  
                                  {/* Utilization Bar */}
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                                      <div className={`h-full ${isDisabled ? 'bg-slate-400' : percent > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
                                  </div>

                                  {/* Actions */}
                                  {canEdit && (
                                      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handlePortAction(port.id, isDisabled ? 'No Shutdown' : 'Shutdown'); }}
                                            className={`flex-1 py-1 text-[10px] font-bold rounded border flex items-center justify-center gap-1 transition ${
                                                isDisabled 
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                            }`}
                                          >
                                              <Power size={10} /> {isDisabled ? 'Enable' : 'Disable'}
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handlePortAction(port.id, 'Reset'); }}
                                            className="px-2 py-1 text-[10px] font-bold rounded border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                            title="Reset Port"
                                          >
                                              <RotateCcw size={10} />
                                          </button>
                                      </div>
                                  )}
                                  
                                  {/* Tooltip List of ONUs */}
                                  {port.children.length > 0 && (
                                      <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-10 p-2 max-h-48 overflow-y-auto">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Connected Clients</p>
                                          {port.children.map(o => (
                                              <div 
                                                key={o.id} 
                                                className="text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer"
                                                onClick={() => onNavigateToDevice(o.id)}
                                              >
                                                  <div className="font-medium text-slate-800">{o.name}</div>
                                                  <div className="text-[10px] text-slate-500">{o.ip_address || o.type}</div>
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
          <div className="animate-in fade-in space-y-6">
              
              {/* UPSTREAM PATH VISUALIZATION */}
              {upstreamPath.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 overflow-x-auto">
                      <h4 className="font-bold text-slate-700 text-xs uppercase mb-3 flex items-center gap-2">
                          <Network size={14} className="text-blue-500" /> Upstream Path (To Core)
                      </h4>
                      <div className="flex items-center gap-2 text-sm min-w-max">
                          {upstreamPath.map((d, i) => (
                              <div key={d.id} className="flex items-center">
                                  <div 
                                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition"
                                    onClick={() => onNavigateToDevice(d.id)}
                                  >
                                      <div className={`w-2 h-2 rounded-full ${d.status === DeviceStatus.ACTIVE ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                      <span className="font-medium text-slate-700">{d.name}</span>
                                      <span className="text-xs text-slate-400 font-mono">({d.type})</span>
                                  </div>
                                  {i < upstreamPath.length && (
                                      <ChevronRight size={16} className="text-slate-400 mx-1" />
                                  )}
                              </div>
                          ))}
                          <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs">
                              Current
                          </div>
                      </div>
                  </div>
              )}

              <NetworkTopologyTree 
                  devices={allDevices}
                  rootDevice={device}
                  onSelectDevice={(d) => onNavigateToDevice(d.id)}
              />
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

      {/* TERMINAL TAB */}
      {activeTab === 'terminal' && canAccessTerminal && (
          <div className="animate-in fade-in">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-xs text-blue-800 flex items-center gap-2">
                  <Shield size={14} />
                  <span>Use CLI for advanced diagnostics. All commands are logged for audit purposes.</span>
              </div>
              <WebTerminal 
                  deviceName={device.name} 
                  ipAddress={device.ip_address || '192.168.1.1'}
                  model={device.model}
              />
          </div>
      )}

    </div>
  );
};

export default DeviceDetail;