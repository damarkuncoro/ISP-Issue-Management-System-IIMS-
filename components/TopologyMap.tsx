import React, { useEffect, useRef } from 'react';
import { Ticket, Severity, TicketStatus } from '../types';

declare const L: any;

interface TopologyMapProps {
  tickets: Ticket[];
}

const TopologyMap: React.FC<TopologyMapProps> = ({ tickets }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Map
    // Default center to Jakarta
    const map = L.map(mapContainerRef.current).setView([-6.2088, 106.8456], 9);
    mapInstanceRef.current = map;

    // Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Icons based on Severity
    const createIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
    };

    const redIcon = createIcon('#dc2626');
    const orangeIcon = createIcon('#ea580c');
    const blueIcon = createIcon('#2563eb');
    const greyIcon = createIcon('#94a3b8');

    // Add Markers
    tickets.forEach(ticket => {
      if (ticket.coordinates && ticket.status !== TicketStatus.CLOSED) {
        let icon = blueIcon;
        if (ticket.severity === Severity.CRITICAL) icon = redIcon;
        else if (ticket.severity === Severity.MAJOR) icon = orangeIcon;
        else if (ticket.status === TicketStatus.RESOLVED) icon = greyIcon;

        const marker = L.marker([ticket.coordinates.lat, ticket.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="font-size: 14px; display:block; margin-bottom:4px;">${ticket.id}</strong>
              <div style="font-size: 12px; margin-bottom:4px;">${ticket.title}</div>
              <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">${ticket.status}</span>
            </div>
          `);
      }
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tickets]); // Re-render if tickets change (naive implementation re-inits map, optimized would update markers)

  return (
    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-lg font-semibold text-slate-800">Network Topology & Outages</h4>
            <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Critical</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600"></span> Major</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Minor</div>
            </div>
        </div>
        <div 
            ref={mapContainerRef} 
            className="w-full h-80 z-0 relative"
            style={{ background: '#f8fafc' }}
        ></div>
    </div>
  );
};

export default TopologyMap;