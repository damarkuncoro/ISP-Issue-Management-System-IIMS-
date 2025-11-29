
import React from 'react';
import { Ticket, TicketStatus, Severity } from '../../types';
import { Activity, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import TopologyMap from '../TopologyMap';

interface NOCDashboardProps {
  tickets: Ticket[];
}

const StatCard = ({ title, value, subtext, icon, colorClass }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const NOCDashboard: React.FC<NOCDashboardProps> = ({ tickets }) => {
  const activeTickets = tickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);
  const criticalCount = activeTickets.filter(t => t.severity === Severity.CRITICAL).length;
  const resolvedToday = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;

  const typeData = [
    { name: 'Network', value: tickets.filter(t => t.type === 'Network').length, color: '#3b82f6' },
    { name: 'Device', value: tickets.filter(t => t.type === 'Device').length, color: '#f59e0b' },
    { name: 'Customer', value: tickets.filter(t => t.type === 'Customer').length, color: '#10b981' },
    { name: 'Infra', value: tickets.filter(t => t.type === 'Infrastructure').length, color: '#ef4444' },
    { name: 'Security', value: tickets.filter(t => t.type === 'Security').length, color: '#8b5cf6' },
  ];

  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === TicketStatus.OPEN).length, color: '#ef4444' },
    { name: 'Investigating', value: tickets.filter(t => t.status === TicketStatus.INVESTIGATING).length, color: '#f97316' },
    { name: 'Assigned', value: tickets.filter(t => t.status === TicketStatus.ASSIGNED).length, color: '#3b82f6' },
    { name: 'Fixing', value: tickets.filter(t => t.status === TicketStatus.FIXING).length, color: '#a855f7' },
    { name: 'Resolved', value: tickets.filter(t => t.status === TicketStatus.RESOLVED).length, color: '#22c55e' },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Issues" 
          value={activeTickets.length} 
          subtext="+2 from yesterday"
          icon={<Activity size={24} />}
          colorClass="text-blue-600"
        />
        <StatCard 
          title="Critical Outages" 
          value={criticalCount} 
          subtext="Requires immediate attention"
          icon={<CheckCircle size={24} />}
          colorClass="text-red-600"
        />
        <StatCard 
          title="SLA Compliance" 
          value="98.2%" 
          subtext="-0.4% this week"
          icon={<Clock size={24} />}
          colorClass="text-orange-500"
        />
        <StatCard 
          title="Resolved Today" 
          value={resolvedToday} 
          subtext="High efficiency"
          icon={<CheckCircle size={24} />}
          colorClass="text-green-600"
        />
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1">
        <TopologyMap tickets={tickets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Type Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Issues by Type</h4>
          <div className="h-64 w-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issues by Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Ticket Status Distribution</h4>
          <div className="h-64 w-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Backbone Traffic (Gbps)</h4>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="download" fill="#3b82f6" name="Ingress" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="upload" fill="#93c5fd" name="Egress" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Worst Links Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800">Top Worst Links (Last 24h)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-3">Link ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Availability</th>
                <th className="px-6 py-3">Avg Latency</th>
                <th className="px-6 py-3">Packet Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-900 font-medium">BB-JKT-BDG-01</td>
                <td className="px-6 py-3 text-slate-600">Backbone Jakarta - Bandung</td>
                <td className="px-6 py-3 text-red-600 font-bold">92.4%</td>
                <td className="px-6 py-3 text-slate-600">45ms</td>
                <td className="px-6 py-3 text-red-500">2.1%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-900 font-medium">METRO-SBY-04</td>
                <td className="px-6 py-3 text-slate-600">Metro Surabaya Ring 4</td>
                <td className="px-6 py-3 text-orange-600 font-bold">98.1%</td>
                <td className="px-6 py-3 text-slate-600">12ms</td>
                <td className="px-6 py-3 text-orange-500">0.5%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-900 font-medium">L3-BKS-RES-01</td>
                <td className="px-6 py-3 text-slate-600">Lastmile Bekasi Residential</td>
                <td className="px-6 py-3 text-green-600 font-bold">99.9%</td>
                <td className="px-6 py-3 text-slate-600">145ms</td>
                <td className="px-6 py-3 text-slate-500">0.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NOCDashboard;
