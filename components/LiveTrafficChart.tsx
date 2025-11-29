
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface TrafficPoint {
  time: string;
  inbound: number; // Mbps
  outbound: number; // Mbps
}

interface LiveTrafficChartProps {
  deviceName: string;
  capacity?: number; // Max capacity in Mbps
}

const LiveTrafficChart: React.FC<LiveTrafficChartProps> = ({ deviceName, capacity = 1000 }) => {
  const [data, setData] = useState<TrafficPoint[]>([]);

  // Initialize with some data
  useEffect(() => {
    const initialData: TrafficPoint[] = [];
    const now = new Date();
    for (let i = 20; i > 0; i--) {
      const t = new Date(now.getTime() - i * 5000); // 5 seconds ago
      initialData.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        inbound: Math.floor(Math.random() * (capacity * 0.4)) + (capacity * 0.1),
        outbound: Math.floor(Math.random() * (capacity * 0.3)) + (capacity * 0.05),
      });
    }
    setData(initialData);
  }, [capacity]);

  // Live Update Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const now = new Date();
        const newPoint = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          // Randomize but keep somewhat consistent with previous to look like a graph
          inbound: Math.max(0, Math.min(capacity, prevData[prevData.length - 1].inbound + (Math.random() - 0.5) * 50)),
          outbound: Math.max(0, Math.min(capacity, prevData[prevData.length - 1].outbound + (Math.random() - 0.5) * 30)),
        };
        return [...prevData.slice(1), newPoint];
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [capacity]);

  const latest = data[data.length - 1] || { inbound: 0, outbound: 0 };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-green-500" /> Live Interface Traffic
            </h4>
            <p className="text-xs text-slate-500">{deviceName} - eth0/1 (Uplink)</p>
        </div>
        <div className="text-right">
            <div className="text-xs font-mono text-green-600">
                <span className="font-bold">RX:</span> {latest.inbound.toFixed(1)} Mbps
            </div>
            <div className="text-xs font-mono text-blue-600">
                <span className="font-bold">TX:</span> {latest.outbound.toFixed(1)} Mbps
            </div>
        </div>
      </div>
      
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{fontSize: 10}} interval={4} />
            <YAxis tick={{fontSize: 10}} />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="inbound" stroke="#22c55e" fillOpacity={1} fill="url(#colorIn)" name="Inbound (RX)" isAnimationActive={false} />
            <Area type="monotone" dataKey="outbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOut)" name="Outbound (TX)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LiveTrafficChart;
