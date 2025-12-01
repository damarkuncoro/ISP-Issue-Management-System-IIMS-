
import React, { useState } from 'react';
import { Device, Customer } from '../types';
import { User, Server, Shield, Info, Lock, Plus, AlertTriangle } from 'lucide-react';

interface IPAMGridProps {
  subnet: string; // e.g. "192.168.1"
  devices: Device[];
  customers: Customer[];
  dhcpRange?: { start: number, end: number };
  rogueIps?: string[];
  onNavigateToDevice: (deviceId: string) => void;
  onNavigateToCustomer: (customerId: string) => void;
  onAssignIp?: (ip: string) => void;
}

const IPAMGrid: React.FC<IPAMGridProps> = ({ subnet, devices, customers, dhcpRange, rogueIps = [], onNavigateToDevice, onNavigateToCustomer, onAssignIp }) => {
  const [hoveredIP, setHoveredIP] = useState<number | null>(null);

  // Generate 256 IPs
  const ips = Array.from({ length: 256 }, (_, i) => i);

  const getIPInfo = (octet: number) => {
    const fullIP = `${subnet}.${octet}`;
    
    // Check Reserved (Gateway/Broadcast)
    if (octet === 0) return { status: 'RESERVED', type: 'Network', name: 'Network Address' };
    if (octet === 1) return { status: 'RESERVED', type: 'Gateway', name: 'Gateway / Router' };
    if (octet === 255) return { status: 'RESERVED', type: 'Broadcast', name: 'Broadcast Address' };

    // Check Devices
    const device = devices.find(d => d.ip_address === fullIP);
    if (device) return { status: 'ASSIGNED', type: 'DEVICE', data: device, name: device.name };

    // Check Customers
    const customer = customers.find(c => c.ip_address === fullIP);
    if (customer) return { status: 'ASSIGNED', type: 'CUSTOMER', data: customer, name: customer.name };

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
      return info.status === 'ASSIGNED' || info.status === 'RESERVED';
  }).length;
  const utilization = Math.round((used / total) * 100);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h3 className="font-mono text-xl font-bold text-slate-800">{subnet}.0/24</h3>
              <p className="text-sm text-slate-500">Class C Subnet Pool</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Utilization</p>
                  <p className={`font-bold text-lg ${utilization > 80 ? 'text-red-600' : 'text-green-600'}`}>{utilization}%</p>
              </div>
              <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Free</p>
                  <p className="font-bold text-slate-700 text-lg">{total - used}</p>
              </div>
              <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Used</p>
                  <p className="font-bold text-blue-600 text-lg">{used}</p>
              </div>
          </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs border-b border-slate-100 pb-4">
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
              <div className="w-3 h-3 bg-red-100 border border-red-400 rounded animate-pulse"></div>
              <span className="text-slate-600">Rogue / Unknown</span>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 sm:grid-cols-16 md:grid-cols-16 lg:grid-cols-32 gap-1.5">
          {ips.map(octet => {
              const info = getIPInfo(octet);
              const fullIP = `${subnet}.${octet}`;
              
              let bgClass = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400';
              if (info.type === 'DHCP') bgClass = 'bg-slate-50 border-2 border-dashed border-slate-300 text-slate-400 opacity-70';
              if (info.status === 'RESERVED') bgClass = 'bg-slate-800 border-slate-900 text-slate-500';
              if (info.type === 'DEVICE') bgClass = 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700 cursor-pointer';
              if (info.type === 'CUSTOMER') bgClass = 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 cursor-pointer';
              if (info.status === 'ROGUE') bgClass = 'bg-red-100 hover:bg-red-200 border-red-400 text-red-700 cursor-pointer animate-pulse';

              const isClickable = info.status === 'AVAILABLE' || info.status === 'ROGUE' || info.status === 'ASSIGNED';

              return (
                  <div 
                    key={octet}
                    className={`relative aspect-square rounded border flex items-center justify-center text-[10px] font-mono transition-all group ${bgClass}`}
                    onMouseEnter={() => setHoveredIP(octet)}
                    onMouseLeave={() => setHoveredIP(null)}
                    onClick={() => {
                        if (info.type === 'DEVICE' && info.data) onNavigateToDevice((info.data as Device).id);
                        else if (info.type === 'CUSTOMER' && info.data) onNavigateToCustomer((info.data as Customer).id);
                        else if ((info.status === 'AVAILABLE' || info.status === 'ROGUE') && onAssignIp) onAssignIp(fullIP);
                    }}
                  >
                      {octet}
                      
                      {/* Action Hint for Free/Rogue IP */}
                      {(info.status === 'AVAILABLE' || info.status === 'ROGUE') && onAssignIp && (
                          <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/80 rounded opacity-0 group-hover:opacity-100 transition">
                              <Plus size={14} className="text-white" />
                          </div>
                      )}

                      {/* Tooltip */}
                      {hoveredIP === octet && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl z-10 pointer-events-none">
                              <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-center">{fullIP}</div>
                              <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                      {info.type === 'DEVICE' && <Server size={12} className="text-purple-400"/>}
                                      {info.type === 'CUSTOMER' && <User size={12} className="text-blue-400"/>}
                                      {(info.status === 'RESERVED' || info.status === 'AVAILABLE') && <Info size={12} className="text-slate-400"/>}
                                      {info.status === 'ROGUE' && <AlertTriangle size={12} className="text-red-400"/>}
                                      <span className="truncate">{info.name}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 capitalize">{info.type.toLowerCase()}</div>
                                  {info.data && (
                                      <div className="text-[10px] text-slate-500 font-mono">ID: {(info.data as any).id}</div>
                                  )}
                                  {(info.status === 'AVAILABLE' || info.status === 'ROGUE') && (
                                      <div className="text-[10px] text-green-400 pt-1">Click to Assign</div>
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

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
          <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
              <p className="font-bold">IPAM Policy Enforced</p>
              <p className="opacity-80">
                  Static IPs are assigned manually by Network Engineers. Dynamic pools (PPPoE/DHCP) are indicated by dashed borders. 
                  Red cells indicate unauthorized (Rogue) devices found by the network scanner.
              </p>
          </div>
      </div>

    </div>
  );
};

export default IPAMGrid;
