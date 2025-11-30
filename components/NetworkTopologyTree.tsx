
import React, { useState } from 'react';
import { Device, DeviceStatus } from '../types';
import { Server, Network, Router, Monitor, ChevronRight, ChevronDown, Wifi, Box, Grid } from 'lucide-react';

interface NetworkTopologyTreeProps {
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
  rootDevice?: Device;
}

interface TreeNodeProps {
  device: Device;
  allDevices: Device[];
  onSelect?: (device: Device) => void;
  level: number;
  isLastChild?: boolean;
}

// Visual Configuration
const INDENT_SIZE = 32; // px
const ICON_SIZE = 20;   // px
const ROW_HEIGHT = 40;  // px

const DeviceIcon = ({ type, status }: { type: string, status: DeviceStatus }) => {
  const colorClass = status === DeviceStatus.ACTIVE ? 'text-blue-600' : 'text-slate-400';
  const bgClass = status === DeviceStatus.ACTIVE ? 'bg-blue-100' : 'bg-slate-100';
  const wrapperClass = `p-1.5 rounded-md ${bgClass} ${colorClass} border border-transparent shadow-sm`;

  switch (type) {
    case 'Router': return <div className={wrapperClass}><Router size={16} /></div>;
    case 'Switch': return <div className={wrapperClass}><Network size={16} /></div>;
    case 'OLT': return <div className={wrapperClass}><Server size={16} /></div>;
    case 'ONU': return <div className={wrapperClass}><Wifi size={16} /></div>;
    case 'ODP':
    case 'ODP (Passive)': return <div className={`p-1.5 rounded-md bg-purple-100 text-purple-600 border border-transparent shadow-sm`}><Box size={16} /></div>;
    case 'ODC':
    case 'ODC (Passive)': return <div className={`p-1.5 rounded-md bg-slate-200 text-slate-700 border border-transparent shadow-sm`}><Grid size={16} /></div>;
    default: return <div className={wrapperClass}><Box size={16} /></div>;
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ device, allDevices, onSelect, level, isLastChild = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const children = allDevices.filter(d => d.uplink_device_id === device.id);
  const hasChildren = children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const isOffline = device.status === DeviceStatus.MAINTENANCE || device.status === DeviceStatus.RETIRED;
  const isPending = device.status === DeviceStatus.PENDING;

  return (
    <div className="relative">
      
      {/* Node Row */}
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border border-transparent ${
            isOffline ? 'opacity-60 grayscale' : ''
        } hover:bg-slate-50 hover:border-blue-100`}
        style={{ marginLeft: `${level * INDENT_SIZE}px` }}
        onClick={() => onSelect && onSelect(device)}
      >
        {/* Toggle Icon */}
        <div 
            onClick={hasChildren ? handleToggle : undefined}
            className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 transition-colors ${hasChildren ? 'cursor-pointer text-slate-500' : 'invisible'}`}
        >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        {/* Device Icon */}
        <DeviceIcon type={device.type} status={device.status} />

        {/* Info */}
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{device.name}</span>
                {isPending && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded font-bold border border-yellow-200">NEW</span>}
                {device.ip_address && <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded">{device.ip_address}</span>}
                {device.port_capacity && <span className="text-[10px] text-purple-500 font-mono bg-purple-50 px-1 rounded border border-purple-100">{children.length}/{device.port_capacity}</span>}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="font-semibold text-slate-600">{device.type}</span> 
                <span className="text-slate-300">•</span> 
                {device.location}
            </div>
        </div>

        {/* Quick Stats for Hubs */}
        {hasChildren && (
            <div className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                {children.length} Links
            </div>
        )}
      </div>

      {/* Children Recursion */}
      {isExpanded && hasChildren && (
        <div className="relative">
            {/* Vertical Line */}
            <div 
                className="absolute border-l-2 border-slate-200" 
                style={{ 
                    left: `${(level * INDENT_SIZE) + 20}px`, 
                    top: '0', 
                    bottom: '18px' 
                }} 
            />
            {children.map((child, index) => (
                <div key={child.id} className="relative">
                    {/* Horizontal Curve Connector */}
                    <div 
                        className="absolute border-b-2 border-l-2 border-slate-200 rounded-bl-xl"
                        style={{
                            left: `${(level * INDENT_SIZE) + 20}px`,
                            top: '-14px', 
                            height: '46px',
                            width: `${INDENT_SIZE}px`
                        }}
                    />
                    <TreeNode 
                        device={child} 
                        allDevices={allDevices} 
                        onSelect={onSelect} 
                        level={level + 1}
                        isLastChild={index === children.length - 1}
                    />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

const NetworkTopologyTree: React.FC<NetworkTopologyTreeProps> = ({ devices, onSelectDevice, rootDevice }) => {
  // Determine which devices to show at the top level
  // If rootDevice is provided, start from there. Otherwise find all root nodes.
  const displayedRoots = rootDevice 
    ? [rootDevice] 
    : devices.filter(d => !d.uplink_device_id || !devices.find(p => p.id === d.uplink_device_id));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Network size={18} className="text-blue-600" /> 
                {rootDevice ? `Topology: ${rootDevice.name}` : 'Network Hierarchy'}
            </h4>
            <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="font-bold text-slate-800">{rootDevice ? 'Tree View' : `${displayedRoots.length} Roots`}</span>
            </div>
        </div>
        
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1 bg-white">
            {displayedRoots.length === 0 ? (
                <div className="text-center text-slate-400 py-10 flex flex-col items-center justify-center h-full">
                    <Network size={48} className="mb-4 opacity-20" />
                    <p>No device topology found.</p>
                    <p className="text-xs mt-2">Ensure devices have 'Uplink' configured.</p>
                </div>
            ) : (
                <div className="space-y-1 min-w-[600px] pb-10">
                    {displayedRoots.map((device, index) => (
                        <TreeNode 
                            key={device.id}
                            device={device}
                            allDevices={devices}
                            onSelect={onSelectDevice}
                            level={0}
                            isLastChild={index === displayedRoots.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default NetworkTopologyTree;