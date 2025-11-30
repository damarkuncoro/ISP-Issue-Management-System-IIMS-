
import React, { useState } from 'react';
import { Device, DeviceStatus } from '../types';
import { Server, Network, Router, Box } from 'lucide-react';

interface RackDiagramProps {
  rackId: string;
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
}

const RackDiagram: React.FC<RackDiagramProps> = ({ rackId, devices, onSelectDevice }) => {
  const [hoveredU, setHoveredU] = useState<number | null>(null);

  // Constants
  const TOTAL_UNITS = 42;

  // Filter devices for this rack
  const rackDevices = devices.filter(d => d.rack_id === rackId && d.u_position);

  // Helper to find device at a specific U
  const getDeviceAtU = (u: number) => {
    return rackDevices.find(d => {
        const start = d.u_position || 0;
        const height = d.u_height || 1;
        const end = start - height + 1;
        return u <= start && u >= end;
    });
  };

  const renderSlot = (u: number) => {
    const device = getDeviceAtU(u);
    const isTopU = device?.u_position === u;
    
    // If this U is occupied, but not the top one, it's part of a multi-U device rendered previously
    if (device && !isTopU) return null; 

    return (
        <div 
            key={u} 
            className="flex items-center gap-2 mb-[1px]"
            onMouseEnter={() => setHoveredU(u)}
            onMouseLeave={() => setHoveredU(null)}
        >
            {/* U Number Label */}
            <div className="w-8 text-right pr-2 text-[10px] text-slate-400 font-mono select-none">
                {u}
            </div>

            {/* Slot / Device */}
            <div 
                className={`flex-1 border rounded relative transition-all overflow-hidden ${
                    device 
                    ? `cursor-pointer ${device.status === DeviceStatus.ACTIVE ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}` 
                    : 'bg-white border-slate-200 h-8 hover:bg-blue-50'
                }`}
                style={{ 
                    height: device ? `${(device.u_height || 1) * 32 + ((device.u_height || 1) - 1) * 4}px` : '32px' // Approx height calc: 32px per U + spacing
                }}
                onClick={() => device && onSelectDevice && onSelectDevice(device)}
            >
                {device && (
                    <div className="flex items-center justify-between px-3 h-full">
                        <div className="flex items-center gap-3">
                            <div className={`p-1 rounded ${device.status === DeviceStatus.ACTIVE ? 'text-green-400 bg-slate-700' : 'text-slate-500 bg-slate-200'}`}>
                                {device.type === 'Router' ? <Router size={14} /> : device.type === 'Switch' ? <Network size={14} /> : <Server size={14} />}
                            </div>
                            <div>
                                <div className={`text-xs font-bold ${device.status === DeviceStatus.ACTIVE ? 'text-white' : 'text-slate-600'}`}>
                                    {device.name}
                                </div>
                                <div className={`text-[9px] font-mono ${device.status === DeviceStatus.ACTIVE ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {device.model} • {device.ip_address}
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Lights Simulation */}
                        {device.status === DeviceStatus.ACTIVE && (
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            </div>
                        )}
                    </div>
                )}

                {!device && hoveredU === u && (
                    <div className="flex items-center justify-center h-full text-[10px] text-blue-400 font-medium">
                        Empty Slot {u}U
                    </div>
                )}
            </div>
            
            {/* Right Side Rail Holes (Visual) */}
            <div className="w-4 flex flex-col justify-between py-1 h-8 opacity-30">
                <div className="w-1 h-1 bg-slate-400 rounded-full mx-auto"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full mx-auto"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full mx-auto"></div>
            </div>
        </div>
    );
  };

  // Generate slots 42 down to 1
  const slots = [];
  for (let i = TOTAL_UNITS; i >= 1; i--) {
      slots.push(renderSlot(i));
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner flex justify-center">
        <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-xl border border-slate-300">
            <div className="text-center border-b border-slate-100 pb-3 mb-3">
                <h3 className="font-bold text-slate-800 text-lg">{rackId}</h3>
                <p className="text-xs text-slate-500">42U Standard Server Rack</p>
            </div>
            
            <div className="bg-slate-100 p-2 rounded border border-slate-200">
                {slots}
            </div>

            <div className="mt-4 flex gap-4 justify-center text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-800 rounded"></div> Active Device
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded"></div> Offline / Planned
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-white border border-slate-300 rounded"></div> Free U
                </div>
            </div>
        </div>
    </div>
  );
};

export default RackDiagram;
