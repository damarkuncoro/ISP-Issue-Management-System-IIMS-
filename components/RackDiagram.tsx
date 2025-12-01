import React, { useState } from 'react';
import { Device, DeviceStatus, DeviceType } from '../types';
import { Server, Network, Router, Box, Zap, Thermometer, LayoutGrid, Power, XCircle, GripVertical, AlertCircle } from 'lucide-react';

interface RackDiagramProps {
  rackId: string;
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
  onUpdateDevice?: (id: string, data: any) => void;
}

const RackDiagram: React.FC<RackDiagramProps> = ({ rackId, devices, onSelectDevice, onUpdateDevice }) => {
  const [hoveredU, setHoveredU] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedDevice, setDraggedDevice] = useState<Device | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  // Constants
  const TOTAL_UNITS = 42;

  // Filter devices for this rack (Mounted)
  const mountedDevices = devices.filter(d => d.rack_id === rackId && d.u_position);
  
  // Devices assigned to this rack/location but not mounted (Unmounted)
  const unmountedDevices = devices.filter(d => 
      (d.rack_id === rackId && !d.u_position) || 
      (!d.rack_id && !d.u_position && d.type !== DeviceType.ONU && d.type !== DeviceType.ODP)
  );

  // Stats Calculation
  const totalU = TOTAL_UNITS;
  const usedU = mountedDevices.reduce((acc, d) => acc + (d.u_height || 1), 0);
  const usagePercent = Math.round((usedU / totalU) * 100);
  
  const calculatePower = (type: DeviceType) => {
      switch(type) {
          case DeviceType.ROUTER: return 150;
          case DeviceType.OLT: return 250;
          case DeviceType.SERVER: return 400;
          case DeviceType.SWITCH: return 80;
          default: return 20;
      }
  };
  const totalPowerWatts = mountedDevices.reduce((acc, d) => acc + calculatePower(d.type), 0);
  const thermalBTU = Math.round(totalPowerWatts * 3.41);

  // Helper to find device at a specific U
  const getDeviceAtU = (u: number) => {
    return mountedDevices.find(d => {
        const start = d.u_position || 0;
        const height = d.u_height || 1;
        const end = start - height + 1;
        return u <= start && u >= end;
    });
  };

  // --- DRAG AND DROP HANDLERS ---

  const handleDragStart = (e: React.DragEvent, device: Device) => {
      if (!isEditMode && device.u_position) return; // Only allow drag in edit mode for mounted devices
      
      setDraggedDevice(device);
      e.dataTransfer.setData('text/plain', device.id);
      e.dataTransfer.effectAllowed = 'move';
      
      // Transparent drag image hack if needed, or default
  };

  const handleDragOver = (e: React.DragEvent, u: number) => {
      e.preventDefault(); // Necessary to allow dropping
      if (!draggedDevice) return;

      const height = draggedDevice.u_height || 1;
      const endU = u - height + 1;

      // Check boundaries
      if (endU < 1) {
          e.dataTransfer.dropEffect = 'none';
          return;
      }

      // Check collisions
      let hasCollision = false;
      for (let i = u; i >= endU; i--) {
          const occupant = getDeviceAtU(i);
          if (occupant && occupant.id !== draggedDevice.id) {
              hasCollision = true;
              break;
          }
      }

      if (!hasCollision) {
          setHoveredU(u);
          setDropError(null);
          e.dataTransfer.dropEffect = 'move';
      } else {
          setDropError(`Not enough space for ${height}U device`);
          e.dataTransfer.dropEffect = 'none';
      }
  };

  const handleDrop = (e: React.DragEvent, u: number) => {
      e.preventDefault();
      setHoveredU(null);
      setDropError(null);

      if (!draggedDevice || !onUpdateDevice) return;

      const height = draggedDevice.u_height || 1;
      const endU = u - height + 1;

      // Final validation before update
      if (endU < 1) return;
      for (let i = u; i >= endU; i--) {
          const occupant = getDeviceAtU(i);
          if (occupant && occupant.id !== draggedDevice.id) return;
      }

      onUpdateDevice(draggedDevice.id, { 
          rack_id: rackId,
          u_position: u 
      });
      setDraggedDevice(null);
  };

  const handleUnmountDevice = (device: Device) => {
      if (onUpdateDevice) {
          onUpdateDevice(device.id, { u_position: null });
      }
  };

  const renderVisuals = (device: Device) => {
      if (device.type === DeviceType.SWITCH) {
          return (
              <div className="flex gap-0.5 opacity-60">
                  {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className="w-3 h-2 bg-slate-800 rounded-[1px] border border-slate-600"></div>
                  ))}
              </div>
          );
      }
      if (device.type === DeviceType.SERVER) {
          return (
              <div className="flex items-center gap-2 w-full pr-4 justify-end">
                  <div className="flex gap-1">
                      <div className="w-1 h-4 bg-slate-800 rounded"></div>
                      <div className="w-1 h-4 bg-slate-800 rounded"></div>
                      <div className="w-1 h-4 bg-slate-800 rounded"></div>
                  </div>
                  <div className="w-20 h-3 bg-slate-700 rounded border border-slate-600"></div>
              </div>
          );
      }
      return null;
  };

  const renderSlot = (u: number) => {
    const device = getDeviceAtU(u);
    const isTopU = device?.u_position === u;
    
    // If this U is occupied, but not the top one, it's part of a multi-U device rendered previously
    if (device && !isTopU) return null; 

    const heightPx = device ? (device.u_height || 1) * 32 + ((device.u_height || 1) - 1) * 2 : 32;
    const isHovered = hoveredU === u;
    const draggingHeight = draggedDevice ? (draggedDevice.u_height || 1) : 1;
    const isHoverZone = isHovered && !device; // Simple highlighting logic

    return (
        <div 
            key={u} 
            className="flex items-start gap-2 mb-[2px]"
            onDragOver={(e) => handleDragOver(e, u)}
            onDrop={(e) => handleDrop(e, u)}
        >
            {/* U Number Label */}
            <div className="w-6 text-right pr-1 text-[10px] text-slate-400 font-mono select-none pt-2">
                {u}
            </div>

            {/* Slot / Device */}
            <div 
                draggable={isEditMode && !!device}
                onDragStart={(e) => device && handleDragStart(e, device)}
                className={`flex-1 rounded relative transition-all overflow-hidden border shadow-sm ${
                    device 
                    ? `cursor-pointer ${
                        device.type === DeviceType.ROUTER ? 'bg-slate-800 border-slate-700' :
                        device.type === DeviceType.SWITCH ? 'bg-slate-700 border-slate-600' :
                        device.type === DeviceType.OLT ? 'bg-indigo-900 border-indigo-800' :
                        'bg-slate-200 border-slate-300'
                      } ${isEditMode ? 'hover:brightness-110' : ''}`
                    : `bg-slate-50 border-slate-200 h-8 ${isHovered ? 'bg-green-100 border-green-300' : ''}`
                }`}
                style={{ 
                    height: `${heightPx}px`,
                    opacity: draggedDevice?.id === device?.id ? 0.5 : 1
                }}
                onClick={() => {
                    if (device && !isEditMode && onSelectDevice) {
                        onSelectDevice(device);
                    }
                }}
            >
                {/* Visual Rail Screws */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400"></div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400"></div>

                {/* Drop Preview Highlight (Green box indicating size) */}
                {isHovered && draggedDevice && !device && (
                    <div 
                        className="absolute top-0 left-0 right-0 bg-green-500/20 border-2 border-green-500 border-dashed z-20 pointer-events-none"
                        style={{ height: `${draggingHeight * 32 + (draggingHeight - 1) * 2}px` }}
                    >
                        <div className="absolute top-1 right-2 text-xs font-bold text-green-700 bg-white/80 px-1 rounded">
                            Drop {draggedDevice.u_height}U
                        </div>
                    </div>
                )}

                {device && (
                    <div className="flex items-center justify-between px-4 h-full relative z-10">
                        {/* Drag Handle (Edit Mode) */}
                        {isEditMode && (
                            <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/10">
                                <GripVertical size={14} className="text-slate-400" />
                            </div>
                        )}

                        {/* Left Info */}
                        <div className={`flex items-center gap-3 ${isEditMode ? 'pl-4' : ''}`}>
                            <div className={`p-1 rounded shadow-sm ${
                                device.status === DeviceStatus.ACTIVE ? 'text-green-400 bg-black/40' : 'text-slate-500 bg-slate-300'
                            }`}>
                                {device.type === 'Router' ? <Router size={12} /> : 
                                 device.type === 'Switch' ? <Network size={12} /> : 
                                 device.type === 'OLT' ? <Zap size={12} /> : <Server size={12} />}
                            </div>
                            
                            <div className="flex flex-col">
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                                    device.status === DeviceStatus.ACTIVE ? 'text-slate-200' : 'text-slate-600'
                                }`}>
                                    {device.model}
                                </div>
                                <div className={`text-[9px] font-mono opacity-80 ${
                                    device.status === DeviceStatus.ACTIVE ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                    {device.name}
                                </div>
                            </div>
                        </div>

                        {/* Middle Visuals (Ports/Vents) */}
                        <div className="flex-1 px-4 hidden sm:flex justify-center">
                            {renderVisuals(device)}
                        </div>
                        
                        {/* Right Status Lights & Controls */}
                        <div className="flex items-center gap-3">
                            {isEditMode ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleUnmountDevice(device); }}
                                    className="p-1 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded transition"
                                    title="Unmount to Staging"
                                >
                                    <XCircle size={14} />
                                </button>
                            ) : device.status === DeviceStatus.ACTIVE && (
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_infinite]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_3s_infinite]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[pulse_1.5s_infinite]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
        
        {/* RACK STATS HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Server className="text-blue-600" /> {rackId} Dashboard
                    </h3>
                    <p className="text-xs text-slate-500">Infrastructure Capacity & Health</p>
                </div>
                {onUpdateDevice && (
                    <div className="flex items-center gap-3">
                        {isEditMode && <span className="text-xs text-orange-600 font-bold animate-pulse">Drag & Drop Enabled</span>}
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                                isEditMode ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {isEditMode ? 'Done Editing' : 'Edit Rack Layout'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Usage Bar */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-600 flex items-center gap-1"><LayoutGrid size={12} /> Space Used</span>
                        <span className="font-mono text-slate-500">{usedU} / {totalU} U</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${usagePercent}%`}}></div>
                    </div>
                </div>

                {/* Power Stats */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-600 block flex items-center gap-1"><Power size={12} /> Power Load</span>
                        <span className="text-lg font-bold text-slate-800">{totalPowerWatts} <span className="text-xs font-normal text-slate-500">Watts</span></span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <Zap size={16} />
                    </div>
                </div>

                {/* Thermal Stats */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-600 block flex items-center gap-1"><Thermometer size={12} /> Thermal Output</span>
                        <span className="text-lg font-bold text-slate-800">{thermalBTU} <span className="text-xs font-normal text-slate-500">BTU/hr</span></span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <Thermometer size={16} />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT: THE RACK */}
            <div className="flex-1 bg-slate-100 p-6 rounded-xl border-2 border-slate-300 shadow-inner w-full max-w-2xl mx-auto lg:mx-0">
                <div className="bg-white px-4 py-6 rounded shadow-xl border border-slate-300 relative">
                    {/* Rack Ears / Posts */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-slate-200 border-r border-slate-300 flex flex-col justify-between py-2 items-center">
                        {Array.from({length: 10}).map((_,i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400"></div>)}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-slate-200 border-l border-slate-300 flex flex-col justify-between py-2 items-center">
                        {Array.from({length: 10}).map((_,i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400"></div>)}
                    </div>

                    {/* Slots */}
                    <div className="px-6 relative">
                        {/* Error Message Toast */}
                        {dropError && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 text-red-700 px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={14} /> {dropError}
                            </div>
                        )}
                        
                        {Array.from({ length: TOTAL_UNITS }).map((_, i) => renderSlot(TOTAL_UNITS - i))}
                    </div>
                </div>
            </div>

            {/* RIGHT: STAGING AREA (Unmounted) */}
            <div className={`w-full lg:w-80 transition-all duration-300 ${isEditMode ? 'opacity-100 translate-x-0' : 'opacity-70'}`}>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                        <h4 className="font-bold text-slate-700 text-sm">Unmounted Assets</h4>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{unmountedDevices.length}</span>
                    </div>
                    
                    {unmountedDevices.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <Box size={24} className="mx-auto mb-2 opacity-50" />
                            All assets are mounted.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                            {unmountedDevices.map(d => (
                                <div 
                                    key={d.id}
                                    draggable={isEditMode}
                                    onDragStart={(e) => handleDragStart(e, d)}
                                    className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                                        isEditMode 
                                        ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-grab active:cursor-grabbing' 
                                        : 'bg-slate-50 border-slate-100 opacity-60 cursor-default'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                                            {d.type === 'Router' ? <Router size={14}/> : <Box size={14}/>}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800">{d.name}</div>
                                            <div className="text-[10px] text-slate-500">{d.model} ({d.u_height || 1}U)</div>
                                        </div>
                                    </div>
                                    {isEditMode && <GripVertical size={14} className="text-slate-300" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {isEditMode && (
                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
                            <strong>How to arrange:</strong>
                            <p className="mt-1">Drag assets from this list or move existing devices within the rack. Green highlights indicate valid drop zones.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
};

export default RackDiagram;