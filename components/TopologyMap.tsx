
import React, { useEffect, useRef } from 'react';
import { Ticket, Severity, TicketStatus, Device, DeviceStatus, DeviceType } from '../types';

declare const L: any;

interface TopologyMapProps {
  tickets?: Ticket[];
  devices?: Device[];
}

const TopologyMap: React.FC<TopologyMapProps> = ({ tickets = [], devices = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map only once
    if (!mapInstanceRef.current) {
        // Default center to Jakarta
        const map = L.map(mapContainerRef.current).setView([-6.2088, 106.8456], 10);
        mapInstanceRef.current = map;

        // Add Tile Layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers (naive approach: remove everything and redraw)
    map.eachLayer((layer: any) => {
        if (!layer._url) { // Don't remove tile layer
            map.removeLayer(layer);
        }
    });

    // --- DRAW LINKS (Cables) FIRST (so they are behind markers) ---
    if (devices.length > 0) {
        devices.forEach(device => {
            if (device.coordinates && device.uplink_device_id) {
                const uplink = devices.find(d => d.id === device.uplink_device_id);
                if (uplink && uplink.coordinates) {
                    
                    // Determine link status color
                    let linkColor = '#94a3b8'; // Default grey
                    if (device.status === DeviceStatus.MAINTENANCE || uplink.status === DeviceStatus.MAINTENANCE) {
                        linkColor = '#f59e0b'; // Orange
                    } else if (device.status === DeviceStatus.ACTIVE && uplink.status === DeviceStatus.ACTIVE) {
                        linkColor = '#22c55e'; // Green
                    } else {
                        linkColor = '#ef4444'; // Red (Broken/Pending)
                    }

                    // Draw Polyline
                    L.polyline([
                        [device.coordinates.lat, device.coordinates.lng],
                        [uplink.coordinates.lat, uplink.coordinates.lng]
                    ], {
                        color: linkColor,
                        weight: 2,
                        opacity: 0.6,
                        dashArray: linkColor === '#ef4444' ? '5, 10' : null // Dashed if broken
                    }).addTo(map);
                }
            }
        });
    }

    // --- DRAW DEVICE MARKERS ---
    devices.forEach(device => {
        if (device.coordinates) {
            // Choose shape/color based on Device Type
            let color = '#3b82f6'; // Blue
            let shape = 'square';
            let label: string = device.type;
            
            if (device.type === DeviceType.ROUTER) { color = '#6366f1'; shape = 'diamond'; } // Indigo
            if (device.type === DeviceType.OLT) { color = '#8b5cf6'; shape = 'square'; } // Purple
            if (device.type === DeviceType.SWITCH) { color = '#0ea5e9'; shape = 'circle'; } // Sky
            if (device.type === DeviceType.ONU) { color = '#10b981'; shape = 'circle'; } // Green
            if (device.type === DeviceType.ODP) { color = '#ec4899'; shape = 'triangle'; label = 'ODP'; } // Pink
            if (device.type === DeviceType.ODC) { color = '#64748b'; shape = 'square'; label = 'ODC'; } // Slate

            if (device.status !== DeviceStatus.ACTIVE) color = '#94a3b8'; // Grey if offline

            // Custom Icon HTML
            let iconShapeStyle = '';
            if (shape === 'circle') iconShapeStyle = 'border-radius: 50%;';
            if (shape === 'diamond') iconShapeStyle = 'transform: rotate(45deg);';
            if (shape === 'triangle') iconShapeStyle = 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%); width: 14px; height: 12px; border: none;';

            const iconHtml = `
                <div style="
                    background-color: ${color}; 
                    width: 12px; height: 12px; 
                    border: 2px solid white; 
                    box-shadow: 0 0 4px rgba(0,0,0,0.4);
                    ${iconShapeStyle}
                "></div>
            `;

            const icon = L.divIcon({
                className: 'device-icon',
                html: iconHtml,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            L.marker([device.coordinates.lat, device.coordinates.lng], { icon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: sans-serif;">
                        <div style="font-size: 10px; font-weight: bold; color: #64748b;">${label}</div>
                        <strong style="font-size: 13px; display:block; margin-bottom:2px;">${device.name}</strong>
                        <div style="font-size: 11px;">${device.ip_address || 'Passive'}</div>
                        <div style="font-size: 10px; margin-top: 4px; padding: 2px 6px; background: #f1f5f9; border-radius: 4px; display: inline-block;">
                            ${device.status}
                        </div>
                    </div>
                `);
        }
    });

    // --- DRAW TICKET MARKERS (Pulse Effect) ---
    tickets.forEach(ticket => {
      if (ticket.coordinates && ticket.status !== TicketStatus.CLOSED) {
        let color = '#3b82f6';
        if (ticket.severity === Severity.CRITICAL) color = '#dc2626';
        else if (ticket.severity === Severity.MAJOR) color = '#ea580c';
        else if (ticket.status === TicketStatus.RESOLVED) color = '#22c55e';

        // Pulse Animation for Critical
        const isPulse = ticket.severity === Severity.CRITICAL;
        const pulseHtml = isPulse ? 
            `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : '';

        const icon = L.divIcon({
          className: 'ticket-icon',
          html: `
            <div style="position: relative; width: 20px; height: 20px;">
                ${pulseHtml}
                <div style="position: absolute; top: 3px; left: 3px; background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
            </div>
            <style>
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            </style>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([ticket.coordinates.lat, ticket.coordinates.lng], { icon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <div style="font-size: 10px; font-weight: bold; color: ${color}; uppercase">TICKET: ${ticket.severity}</div>
              <strong style="font-size: 13px; display:block; margin-bottom:4px;">${ticket.id}</strong>
              <div style="font-size: 12px; margin-bottom:4px;">${ticket.title}</div>
              <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">${ticket.status}</span>
            </div>
          `);
      }
    });

  }, [tickets, devices]);

  return (
    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
            <div>
                <h4 className="text-lg font-semibold text-slate-800">Geographic Topology</h4>
                <p className="text-xs text-slate-500">Physical assets & incident visualization</p>
            </div>
            <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1"><span className="w-3 h-1 bg-green-500"></span> Link OK</div>
                <div className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500"></span> Link Down</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 border border-white"></span> Critical Ticket</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-pink-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div> ODP</div>
            </div>
        </div>
        <div 
            ref={mapContainerRef} 
            className="w-full flex-1 min-h-[400px] z-0 relative"
            style={{ background: '#f8fafc' }}
        ></div>
    </div>
  );
};

export default TopologyMap;
