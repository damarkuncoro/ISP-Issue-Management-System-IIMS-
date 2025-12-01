import React, { useState } from 'react';
import { Device, Customer, RadiusSession } from '../types';
import { User, Server, Shield, Info, Lock, Plus, AlertTriangle, Wifi, Table, Grid, XCircle, LogOut, Filter } from 'lucide-react';

interface IPAMGridProps {
  subnet: string; // e.g. "192.168.1"
  devices: Device[];
  customers: Customer[];
  dhcpRange?: { start: number, end: number };
  rogueIps?: string[];
  radiusSessions?: RadiusSession[];
  onNavigateToDevice: (deviceId: string) => void;
  onNavigateToCustomer: (customerId: string) => void;
  onAssignIp?: (ip: string) => void;
  onKickSession?: (sessionId: string) => void; // New prop for Radius integration
}

const IPAMGrid: React.FC<IPAMGridProps> = ({ subnet, devices, customers, dhcpRange, rogueIps = [], radiusSessions = [], onNavigateToDevice, onNavigateToCustomer, onAssignIp, onKickSession }) => {
  const [hoveredIP, setHoveredIP] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Generate 256 IPs
  const ips = Array.from({ length: 256 }, (_, i) => i);

  const getIPInfo = (octet: number) => {
    const fullIP = `${subnet}.${octet}`;
    
    // Check Reserved (Gateway/Broadcast)
    if (octet === 0) return { status: 'RESERVED', type: 'Network', name: 'Network Address' };
    if (octet === 1) return { status: 'RESERVED', type: 'Gateway', name: 'Gateway / Router' };
    if (octet === 255) return { status: 'RESERVED', type: 'Broadcast', name: 'Broadcast Address' };

    // Check Devices (Static)
    const device = devices.find(d => d.ip_address === fullIP);
    if (device) return { status: 'ASSIGNED', type: 'DEVICE', data: device, name: device.name };

    // Check Customers (Static)
    const customer = customers.find(c => c.ip_address === fullIP);
    if (customer) return { status: 'ASSIGNED', type: 'CUSTOMER', data: customer, name: customer.name };

    // Check Dynamic Leases (Radius/AAA)
    const session = radiusSessions.find(s => s.ip_address === fullIP && s.status === 'Active');
    if (session) return { status: 'LEASED', type: 'SESSION', data: session, name: `User: ${session.username}` };

    // Check Rogue IPs
    if (rogueIps.includes(fullIP)) return { status: 'ROGUE', type: 'UNKNOWN', name: 'Unknown Device Detected' };

    // Check DHCP Range
    const isDhcp = dhcpRange && octet >= dhcpRange.start && octet <= dhcpRange.end;

    return { status: 'AVAILABLE', type: isDhcp ? 'DHCP' : 'STATIC', name: isDhcp ? 'DHCP Pool' : 'Available Static' };
  };

  // Stats
  const total = 256;
  const used = ips.filter(i => {
      const info = getIPInfo(i);
      return info.status === 'ASSIGNED' || info.status === 'RESERVED' || info.status === 'LEASED';
  }).length;
  
  // Detailed Stats
  const usedStatic = ips.filter(i => {
      const info = getIPInfo(i);
      return info.status === 'ASSIGNED' || info.status === 'RESERVED';
  }).length;
  
  const usedDynamic = ips.filter(i => {
      const info = getIPInfo(i);
      return info.status === 'LEASED';
  }).length;

  const utilization = Math.round((used / total) * 100);

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'AVAILABLE': return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">Free</span>;
          case 'RESERVED': return <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">Reserved</span>;
          case 'ASSIGNED': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Static</span>;
          case 'LEASED': return <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-200">Dynamic</span>;
          case 'ROGUE': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 animate-pulse">Alert</span>;
          default: return null;
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h3 className="font-mono text-xl font-bold text-slate-800">{subnet}.0/24</h3>
              <p className="text-sm text-slate-500">Class C Subnet Pool</p>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setViewMode('GRID')}
                    className={`p-1.5 rounded-md transition ${viewMode === 'GRID' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Grid View"
                  >
                      <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('TABLE')}
                    className={`p-1.5 rounded-md transition ${viewMode === 'TABLE' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Table View"
                  >
                      <Table size={18} />
                  </button>
              </div>

              <div className="flex items-center gap-4 text-sm border-l border-slate-200 pl-6">
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold">Utilization</p>
                    <p className={`font-bold text-lg ${utilization > 80 ? 'text-red-600' : 'text-green-600'}`}>{utilization}%</p>
                </div>
                <div className="text-center hidden xl:block">
                    <p className="text-xs text-slate-400 uppercase font-bold">Static</p>
                    <p className="font-bold text-slate-700 text-lg">{usedStatic}</p>
                </div>
                <div className="text-center hidden xl:block">
                    <p className="text-xs text-slate-400 uppercase font-bold">Dynamic</p>
                    <p className="font-bold text-cyan-600 text-lg">{usedDynamic}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold">Free</p>
                    <p className="font-bold text-slate-500 text-lg">{total - used}</p>
                </div>
              </div>
          </div>
      </div>

      {viewMode === 'GRID' ? (
        <>
            {/* Legend & Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-100 pb-4 gap-4">
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></div>
                        <span className="text-slate-600">Static Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white border-2 border-slate-300 border-dashed rounded opacity-50"></div>
                        <span className="text-slate-600">DHCP Pool</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                        <span className="text-slate-600">Infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                        <span className="text-slate-600">Customer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-100 border border-cyan-300 rounded shadow-[0_0_4px_rgba(34,211,238,0.4)]"></div>
                        <span className="text-slate-600">Active Lease (Radius)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-400 rounded animate-pulse"></div>
                        <span className="text-slate-600">Rogue / Unknown</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                    <Filter size={14} className="text-slate-400" />
                    <select 
                        className="text-xs border-none bg-transparent font-bold text-slate-600 focus:outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Show All</option>
                        <option value="AVAILABLE">Free & Available</option>
                        <option value="ASSIGNED">Assigned (Static)</option>
                        <option value="LEASED">Dynamic Leases</option>
                        <option value="ROGUE">Security Alerts</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-16 md:grid-cols-16 lg:grid-cols-32 gap-1.5">
                {ips.map(octet => {
                    const info = getIPInfo(octet);
                    const fullIP = `${subnet}.${octet}`;
                    
                    // Filter Logic for Grid (Dimming)
                    let isDimmed = false;
                    if (statusFilter !== 'ALL') {
                        if (statusFilter === 'AVAILABLE' && info.status !== 'AVAILABLE') isDimmed = true;
                        if (statusFilter === 'ASSIGNED' && info.status !== 'ASSIGNED' && info.status !== 'RESERVED') isDimmed = true;
                        if (statusFilter === 'LEASED' && info.status !== 'LEASED') isDimmed = true;
                        if (statusFilter === 'ROGUE' && info.status !== 'ROGUE') isDimmed = true;
                    }

                    let bgClass = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400';
                    if (info.type === 'DHCP') bgClass = 'bg-slate-50 border-2 border-dashed border-slate-300 text-slate-400 opacity-70';
                    if (info.status === 'RESERVED') bgClass = 'bg-slate-800 border-slate-900 text-slate-500';
                    if (info.type === 'DEVICE') bgClass = 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700 cursor-pointer';
                    if (info.type === 'CUSTOMER') bgClass = 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 cursor-pointer';
                    if (info.type === 'SESSION') bgClass = 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-700 cursor-pointer shadow-inner';
                    if (info.status === 'ROGUE') bgClass = 'bg-red-100 hover:bg-red-200 border-red-400 text-red-700 cursor-pointer animate-pulse';

                    return (
                        <div 
                            key={octet}
                            className={`relative aspect-square rounded border flex items-center justify-center text-[10px] font-mono transition-all group ${bgClass} ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
                            onMouseEnter={() => setHoveredIP(octet)}
                            onMouseLeave={() => setHoveredIP(null)}
                            onClick={() => {
                                if (info.type === 'DEVICE' && info.data) onNavigateToDevice((info.data as Device).id);
                                else if (info.type === 'CUSTOMER' && info.data) onNavigateToCustomer((info.data as Customer).id);
                                else if (info.type === 'SESSION' && info.data) {
                                    const session = info.data as RadiusSession;
                                    if(session.customer_id) onNavigateToCustomer(session.customer_id);
                                }
                                else if ((info.status === 'AVAILABLE' || info.status === 'ROGUE') && onAssignIp) onAssignIp(fullIP);
                            }}
                        >
                            {octet}
                            
                            {/* Action Hint for Free/Rogue IP */}
                            {(info.status === 'AVAILABLE' || info.status === 'ROGUE') && onAssignIp && !isDimmed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/80 rounded opacity-0 group-hover:opacity-100 transition">
                                    <Plus size={14} className="text-white" />
                                </div>
                            )}

                            {/* Action Hint for Active Session - Kick */}
                            {info.type === 'SESSION' && onKickSession && !isDimmed && (
                                <div className="absolute top-0 right-0 p-0.5 opacity-0 group-hover:opacity-100 transition z-20">
                                    <button 
                                        className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onKickSession((info.data as any).id);
                                        }}
                                        title="Kick Session"
                                    >
                                        <XCircle size={10} />
                                    </button>
                                </div>
                            )}

                            {/* Tooltip */}
                            {hoveredIP === octet && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 pointer-events-none">
                                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-center">{fullIP}</div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {info.type === 'DEVICE' && <Server size={12} className="text-purple-400"/>}
                                            {info.type === 'CUSTOMER' && <User size={12} className="text-blue-400"/>}
                                            {info.type === 'SESSION' && <Wifi size={12} className="text-cyan-400"/>}
                                            {(info.status === 'RESERVED' || info.status === 'AVAILABLE') && <Info size={12} className="text-slate-400"/>}
                                            {info.status === 'ROGUE' && <AlertTriangle size={12} className="text-red-400"/>}
                                            <span className="truncate">{info.name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 capitalize">{info.type.toLowerCase()}</div>
                                        {info.data && (info.type === 'DEVICE' || info.type === 'CUSTOMER') && (
                                            <div className="text-[10px] text-slate-500 font-mono">ID: {(info.data as any).id}</div>
                                        )}
                                        {info.type === 'SESSION' && (
                                            <div className="text-[10px] text-cyan-500 font-mono">Radius Active</div>
                                        )}
                                        {(info.status === 'AVAILABLE' || info.status === 'ROGUE') && (
                                            <div className="text-[10px] text-green-400 pt-1">Click to Register</div>
                                        )}
                                    </div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            
            <div className="p-4 border-b border-slate-100 flex justify-end">
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                    <Filter size={14} className="text-slate-400" />
                    <select 
                        className="text-xs border-none bg-transparent font-bold text-slate-600 focus:outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Show All</option>
                        <option value="AVAILABLE">Free & Available</option>
                        <option value="ASSIGNED">Assigned (Static)</option>
                        <option value="LEASED">Dynamic Leases</option>
                        <option value="ROGUE">Security Alerts</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">IP Address</th>
                            <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">Status</th>
                            <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">Entity Type</th>
                            <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">Assigned To / Details</th>
                            <th className="px-6 py-3 border-b border-slate-200 bg-slate-50 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {ips.map(octet => {
                            const info = getIPInfo(octet);
                            const fullIP = `${subnet}.${octet}`;
                            
                            // Filter Logic for Table (Remove Rows)
                            if (statusFilter !== 'ALL') {
                                if (statusFilter === 'AVAILABLE' && info.status !== 'AVAILABLE') return null;
                                if (statusFilter === 'ASSIGNED' && info.status !== 'ASSIGNED' && info.status !== 'RESERVED') return null;
                                if (statusFilter === 'LEASED' && info.status !== 'LEASED') return null;
                                if (statusFilter === 'ROGUE' && info.status !== 'ROGUE') return null;
                            }

                            return (
                                <tr key={octet} className="hover:bg-slate-50">
                                    <td className="px-6 py-2.5 font-mono text-slate-700">
                                        {fullIP}
                                    </td>
                                    <td className="px-6 py-2.5">
                                        {getStatusBadge(info.status)}
                                    </td>
                                    <td className="px-6 py-2.5 text-xs text-slate-600">
                                        {info.type === 'DEVICE' && <span className="flex items-center gap-1.5"><Server size={14} className="text-purple-500" /> Infrastructure</span>}
                                        {info.type === 'CUSTOMER' && <span className="flex items-center gap-1.5"><User size={14} className="text-blue-500" /> Customer Static</span>}
                                        {info.type === 'SESSION' && <span className="flex items-center gap-1.5"><Wifi size={14} className="text-cyan-500" /> Radius Lease</span>}
                                        {info.type === 'DHCP' && <span className="text-slate-400 italic">DHCP Pool</span>}
                                        {info.type === 'Network' && <span className="text-slate-500">Subnet ID</span>}
                                        {info.type === 'Gateway' && <span className="text-slate-500">Gateway</span>}
                                        {info.type === 'Broadcast' && <span className="text-slate-500">Broadcast</span>}
                                        {info.type === 'UNKNOWN' && <span className="flex items-center gap-1.5 text-red-600 font-bold"><AlertTriangle size={14} /> Rogue Device</span>}
                                        {info.type === 'STATIC' && <span className="text-slate-400">Available</span>}
                                    </td>
                                    <td className="px-6 py-2.5">
                                        <div className="font-medium text-slate-800 text-sm truncate max-w-[200px]">{info.name}</div>
                                        {info.data && (info.type === 'DEVICE' || info.type === 'CUSTOMER') && (
                                            <div className="text-[10px] text-slate-400 font-mono">ID: {(info.data as any).id}</div>
                                        )}
                                        {info.data && (info.data as any).mac_address && (
                                            <div className="text-[10px] text-slate-400 font-mono uppercase">MAC: {(info.data as any).mac_address}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-2.5 text-right">
                                        {(info.type === 'DEVICE' || info.type === 'CUSTOMER') && (
                                            <button 
                                                onClick={() => info.type === 'DEVICE' ? onNavigateToDevice((info.data as Device).id) : onNavigateToCustomer((info.data as Customer).id)}
                                                className="text-xs text-blue-600 hover:underline font-medium"
                                            >
                                                View Details
                                            </button>
                                        )}
                                        {(info.status === 'AVAILABLE' || info.status === 'ROGUE') && onAssignIp && (
                                            <button 
                                                onClick={() => onAssignIp(fullIP)}
                                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition"
                                            >
                                                Assign IP
                                            </button>
                                        )}
                                        {info.type === 'SESSION' && info.data && (
                                            <div className="flex items-center justify-end gap-2">
                                                {(info.data as any).customer_id && (
                                                    <button 
                                                        onClick={() => onNavigateToCustomer((info.data as any).customer_id)}
                                                        className="text-xs text-cyan-600 hover:underline font-medium"
                                                    >
                                                        View Session
                                                    </button>
                                                )}
                                                {onKickSession && (
                                                    <button 
                                                        onClick={() => onKickSession((info.data as any).id)}
                                                        className="text-xs text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-2 py-0.5 rounded transition flex items-center gap-1"
                                                        title="Disconnect"
                                                    >
                                                        <LogOut size={10} /> Kick
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
          <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
              <p className="font-bold">IPAM Policy Enforced</p>
              <p className="opacity-80">
                  Static IPs are assigned manually. Dynamic leases (Cyan) are synced from the Radius server. 
                  Red cells indicate unauthorized (Rogue) devices found by the network scanner.
                  Click the 'X' on active sessions to force a disconnect (CoA).
              </p>
          </div>
      </div>

    </div>
  );
};

export default IPAMGrid;