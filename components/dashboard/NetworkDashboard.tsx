
import React from 'react';
import { Ticket, TicketType } from '../../types';
import { Activity, Server, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TopologyMap from '../TopologyMap';

interface NetworkDashboardProps {
  tickets: Ticket[];
}

const StatCard = ({ title, value, subtext, icon, colorClass }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const NetworkDashboard: React.FC<NetworkDashboardProps> = ({ tickets }) => {
  const trafficData = [
    { time: '00:00', upload: 4000, download: 2400 },
    { time: '04:00', upload: 3000, download: 1398 },
    { time: '08:00', upload: 2000, download: 8800 },
    { time: '12:00', upload: 2780, download: 3908 },
    { time: '16:00', upload: 1890, download: 4800 },
    { time: '20:00', upload: 2390, download: 3800 },
    { time: '23:59', upload: 3490, download: 4300 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Backbone Load" value="78%" subtext="Peak detected at Jakarta" icon={<Activity size={24} />} colorClass="text-orange-600" />
        <StatCard title="Core Devices" value="142" subtext="2 Devices with warnings" icon={<Server size={24} />} colorClass="text-blue-600" />
        <StatCard title="Threats Blocked" value="12k" subtext="Last 24 hours" icon={<Shield size={24} />} colorClass="text-purple-600" />
        <StatCard title="Avg Latency" value="12ms" subtext="Intra-network" icon={<Activity size={24} />} colorClass="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Real-time Traffic (Core Network)</h4>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="download" fill="#3b82f6" name="Ingress" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upload" fill="#93c5fd" name="Egress" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Worst Performing Links</h4>
          <div className="space-y-4">
            {[
              {name: 'BB-JKT-BDG-01', loss: '2.1%', latency: '45ms', status: 'Degraded'},
              {name: 'METRO-SBY-04', loss: '0.5%', latency: '12ms', status: 'Warning'},
              {name: 'INT-GATEWAY-02', loss: '0.0%', latency: '180ms', status: 'Normal'},
            ].map((link, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">{link.name}</p>
                  <p className="text-xs text-slate-500">Loss: {link.loss} • Lat: {link.latency}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${link.status === 'Degraded' ? 'bg-red-100 text-red-600' : link.status === 'Warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{link.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1">
        <h4 className="font-semibold text-slate-700 mb-4">Network Topology Status</h4>
        <TopologyMap tickets={tickets.filter(t => t.type === TicketType.NETWORK || t.type === TicketType.INFRASTRUCTURE)} />
      </div>
    </div>
  );
};

export default NetworkDashboard;
