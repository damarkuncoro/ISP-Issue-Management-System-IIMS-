
import React, { useState } from 'react';
import { Device, DeviceStatus } from '../types';
import { Server, Network, Router, Monitor, ChevronRight, ChevronDown, Circle, Zap, Wifi } from 'lucide-react';

interface NetworkTopologyTreeProps {
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
}

interface TreeNodeProps {
  device: Device;
  allDevices: Device[];
  onSelect?: (device: Device) => void;
  level: number;
  isLastChild?: boolean;
  parentPath: boolean[]; // Array to track vertical lines for indentation
}

const DeviceIcon = ({ type, status }: { type: string, status: DeviceStatus }) => {
  const colorClass = status === DeviceStatus.ACTIVE ? 'text-blue-600' : 'text-slate-400';
  
  switch (type) {
    case 'Router': return <Router size={16} className={colorClass} />;
    case 'Switch': return <Network size={16} className={colorClass} />;
    case 'OLT': return <Server size={16} className={colorClass} />;
    case 'ONU': return <Wifi size={16} className={colorClass} />;
    default: return <Monitor size={16} className={colorClass} />;
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ device, allDevices, onSelect, level, isLastChild = true, parentPath }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const children = allDevices.filter(d => d.uplink_device_id === device.id);
  const hasChildren = children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Status Indicator
  const isOffline = device.status === DeviceStatus.MAINTENANCE || device.status === DeviceStatus.RETIRED;
  const isPending = device.status === DeviceStatus.PENDING;

  return (
    <div className="relative">
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors group border border-transparent ${
            isOffline ? 'opacity-60 grayscale' : ''
        } hover:bg-blue-50 hover:border-blue-100`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => onSelect && onSelect(device)}
      >
        {/* Toggle / Leaf Icon */}
        <div 
            onClick={hasChildren ? handleToggle : undefined}
            className={`w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition ${hasChildren ? 'cursor-pointer' : 'invisible'}`}
        >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        {/* Device Icon Box */}
        <div className={`p-1.5 rounded-md border shadow-sm ${
            isPending ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'
        }`}>
            <DeviceIcon type={device.type} status={device.status} />
        </div>

        {/* Info */}
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{device.name}</span>
                {isPending && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded font-bold">NEW</span>}
                <span className="text-[10px] text-slate-400 font-mono">{device.ip_address || 'No IP'}</span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="font-semibold">{device.type}</span> • {device.location}
            </div>
        </div>

        {/* Quick Stats (Mock) */}
        {device.type === 'OLT' && (
            <div className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded hidden group-hover:block">
                {children.length} Connected ONUs
            </div>
        )}
      </div>

      {/* Children Recursion */}
      {isExpanded && hasChildren && (
        <div className="relative">
            {/* Vertical Line Connector from Parent */}
            <div 
                className="absolute border-l-2 border-slate-200" 
                style={{ 
                    left: `${(level * 24) + 9}px`, // Center of the expand icon
                    top: '0', 
                    bottom: '12px' // Stop before the last item curve
                }} 
            />
            {children.map((child, index) => (
                <div key={child.id} className="relative">
                    {/* Horizontal Curve Connector */}
                    <div 
                        className="absolute border-b-2 border-l-2 border-slate-200 rounded-bl-xl"
                        style={{
                            left: `${(level * 24) + 9}px`,
                            top: '-10px', // Start from parent bottom
                            height: '42px', // Connect to child middle
                            width: '16px'
                        }}
                    />
                    <TreeNode 
                        device={child} 
                        allDevices={allDevices} 
                        onSelect={onSelect} 
                        level={level + 1}
                        parentPath={[...parentPath, !isLastChild]} 
                        isLastChild={index === children.length - 1}
                    />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

const NetworkTopologyTree: React.FC<NetworkTopologyTreeProps> = ({ devices, onSelectDevice }) => {
  // 1. Find Root Nodes (Devices with NO Uplink OR Uplink not in list)
  // This handles case where uplink might be "Cloud" or external ID not in array
  const rootDevices = devices.filter(d => 
    !d.uplink_device_id || !devices.find(p => p.id === d.uplink_device_id)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Network size={18} className="text-blue-600" /> Network Hierarchy
            </h4>
            <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">{devices.length}</span> Devices
            </div>
        </div>
        
        <div className="p-6 overflow-x-auto min-h-[400px]">
            {rootDevices.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                    <p>No devices found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {rootDevices.map((device, index) => (
                        <TreeNode 
                            key={device.id}
                            device={device}
                            allDevices={devices}
                            onSelect={onSelectDevice}
                            level={0}
                            parentPath={[]}
                            isLastChild={index === rootDevices.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default NetworkTopologyTree;
