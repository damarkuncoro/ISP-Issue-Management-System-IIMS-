
import React from 'react';
import { Ticket, Severity } from '../../types';
import { Activity, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ManagerDashboardProps {
  tickets: Ticket[];
  onNavigateToTicket: (ticket: Ticket) => void;
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

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ tickets, onNavigateToTicket }) => {
  const slaTrendData = [
    { day: 'Mon', sla: 99.1 },
    { day: 'Tue', sla: 98.4 },
    { day: 'Wed', sla: 98.8 },
    { day: 'Thu', sla: 97.5 },
    { day: 'Fri', sla: 98.2 },
  ];

  const typeData = [
    { name: 'Network', value: tickets.filter(t => t.type === 'Network').length },
    { name: 'Device', value: tickets.filter(t => t.type === 'Device').length },
    { name: 'Customer', value: tickets.filter(t => t.type === 'Customer').length },
    { name: 'Infra', value: tickets.filter(t => t.type === 'Infrastructure').length },
    { name: 'Security', value: tickets.filter(t => t.type === 'Security').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="SLA Compliance" value="98.2%" subtext="-0.4% vs last week" icon={<Activity size={24} />} colorClass="text-blue-600" />
        <StatCard title="MTTR (Avg)" value="3.5h" subtext="Mean Time To Resolve" icon={<Clock size={24} />} colorClass="text-orange-600" />
        <StatCard title="Est. Revenue Loss" value="$450" subtext="Based on downtime" icon={<DollarSign size={24} />} colorClass="text-red-600" />
        <StatCard title="Cust. Satisfaction" value="4.2/5" subtext="Based on feedback" icon={<TrendingUp size={24} />} colorClass="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">SLA Trend (Last 5 Days)</h4>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={slaTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="sla" stroke="#2563eb" strokeWidth={3} dot={{r:4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Ticket Volume Distribution</h4>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Critical Incident Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-6 py-3">Issue</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Root Cause</th>
                <th className="px-6 py-3">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.filter(t => t.severity === Severity.CRITICAL).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onNavigateToTicket(t)}>
                  <td className="px-6 py-3 font-medium">{t.id}</td>
                  <td className="px-6 py-3">{t.title}</td>
                  <td className="px-6 py-3 text-red-600">Active</td>
                  <td className="px-6 py-3 text-slate-500">Under Investigation</td>
                  <td className="px-6 py-3">{t.impact_users} Users</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
