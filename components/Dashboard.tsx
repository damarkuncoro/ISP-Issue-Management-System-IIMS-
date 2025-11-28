
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Ticket, TicketStatus, Severity, UserRole, TicketType } from '../types';
import { Activity, CheckCircle, Clock, MapPin, Truck, Shield, Server, DollarSign, TrendingUp } from 'lucide-react';
import TopologyMap from './TopologyMap';
import HelpdeskDashboard from './dashboard/HelpdeskDashboard';

interface DashboardProps {
  tickets: Ticket[];
  userRole?: UserRole;
  onCreateTicket: (data: any) => void;
  onNavigateToTicket: (ticket: Ticket) => void;
  onViewAllTickets: () => void;
}

const StatCard = ({ title, value, subtext, icon, colorClass, active }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string, active?: boolean }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border ${active ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'} flex items-start justify-between transition-all hover:shadow-md`}>
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

const Dashboard: React.FC<DashboardProps> = ({ tickets, userRole = UserRole.NOC, onCreateTicket, onNavigateToTicket, onViewAllTickets }) => {
  const activeTickets = tickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);
  const criticalCount = activeTickets.filter(t => t.severity === Severity.CRITICAL).length;
  const resolvedToday = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;
  
  // Data for Charts
  const typeData = [
    { name: 'Network', value: tickets.filter(t => t.type === 'Network').length, color: '#3b82f6' },
    { name: 'Device', value: tickets.filter(t => t.type === 'Device').length, color: '#f59e0b' },
    { name: 'Customer', value: tickets.filter(t => t.type === 'Customer').length, color: '#10b981' },
    { name: 'Infra', value: tickets.filter(t => t.type === 'Infrastructure').length, color: '#ef4444' },
    { name: 'Security', value: tickets.filter(t => t.type === 'Security').length, color: '#8b5cf6' },
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

  const slaTrendData = [
    { day: 'Mon', sla: 99.1 },
    { day: 'Tue', sla: 98.4 },
    { day: 'Wed', sla: 98.8 },
    { day: 'Thu', sla: 97.5 },
    { day: 'Fri', sla: 98.2 },
  ];

  // --- RENDERERS FOR SPECIFIC ROLES ---

  const renderFieldTechnicianView = () => {
    const myTickets = activeTickets.filter(t => t.type === TicketType.INFRASTRUCTURE || t.type === TicketType.CUSTOMER);
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
             <div>
                <h3 className="text-xl font-bold">Good Afternoon, Field Team.</h3>
                <p className="opacity-90">You have {myTickets.length} active jobs assigned in your queue.</p>
             </div>
             <Truck size={40} className="opacity-80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatCard 
                title="Pending Jobs" 
                value={myTickets.length} 
                subtext="Within 5km radius"
                icon={<MapPin size={24} />}
                colorClass="text-blue-600"
                active
              />
               <StatCard 
                title="Avg Resolution Time" 
                value="2h 15m" 
                subtext="-15m from last week"
                icon={<Clock size={24} />}
                colorClass="text-green-600"
              />
              <StatCard 
                title="SLA Breaches" 
                value="0" 
                subtext="Great job!"
                icon={<CheckCircle size={24} />}
                colorClass="text-purple-600"
              />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <h4 className="font-semibold text-slate-700 mb-4">Task Location Map</h4>
                 <TopologyMap tickets={myTickets} />
            </div>
            <div>
                 <h4 className="font-semibold text-slate-700 mb-4">My Task Queue</h4>
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {myTickets.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No active tasks.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                             {myTickets.map(t => (
                                 <div key={t.id} className="p-4 hover:bg-slate-50 border-l-4 border-l-blue-500 cursor-pointer" onClick={() => onNavigateToTicket(t)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-slate-800 text-sm">{t.id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.severity === Severity.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{t.severity}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-800">{t.title}</p>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {t.location}</p>
                                    <div className="mt-3">
                                        <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded hover:bg-slate-900">Start Travel</button>
                                    </div>
                                 </div>
                             ))}
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </div>
    );
  };

  const renderNetworkEngineerView = () => {
    return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Backbone Load" value="78%" subtext="Peak detected at Jakarta" icon={<Activity size={24} />} colorClass="text-orange-600" />
            <StatCard title="Core Devices" value="142" subtext="2 Devices with warnings" icon={<Server size={24} />} colorClass="text-blue-600" />
            <StatCard title="Threats Blocked" value="12k" subtext="Last 24 hours" icon={<Shield size={24} />} colorClass="text-purple-600" />
            <StatCard title="Avg Latency" value="12ms" subtext="Intra-network" icon={<Activity size={24} />} colorClass="text-green-600" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Real-time Traffic (Core Network)</h4>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
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

  const renderManagerView = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="SLA Compliance" value="98.2%" subtext="-0.4% vs last week" icon={<Activity size={24} />} colorClass="text-blue-600" />
                <StatCard title="MTTR (Avg)" value="3.5h" subtext="Mean Time To Resolve" icon={<Clock size={24} />} colorClass="text-orange-600" />
                <StatCard title="Est. Revenue Loss" value="$450" subtext="Based on downtime" icon={<DollarSign size={24} />} colorClass="text-red-600" />
                <StatCard title="Cust. Satisfaction" value="4.2/5" subtext="Based on feedback" icon={<TrendingUp size={24} />} colorClass="text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">SLA Trend (Last 5 Days)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
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
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
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

  const renderDefaultNOCView = () => {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issues by Type Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Issues by Type</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
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
                </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {typeData.map((item) => (
                <div key={item.name} className="flex items-center text-sm text-slate-600">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                    {item.name}: {item.value}
                </div>
                ))}
            </div>
            </div>

            {/* Traffic Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Backbone Traffic (Gbps)</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f1f5f9'}}
                    />
                    <Bar dataKey="download" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="upload" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
                </ResponsiveContainer>
            </div>
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

  // Main Render Switch
  switch (userRole) {
    case UserRole.FIELD:
        return renderFieldTechnicianView();
    case UserRole.NETWORK:
        return renderNetworkEngineerView();
    case UserRole.HELPDESK:
        return (
          <HelpdeskDashboard 
            tickets={tickets} 
            onCreateTicket={onCreateTicket} 
            onNavigateToTicket={onNavigateToTicket}
            onViewAllTickets={onViewAllTickets}
          />
        );
    case UserRole.MANAGER:
        return renderManagerView();
    case UserRole.NOC:
    default:
        return renderDefaultNOCView();
  }
};

export default Dashboard;
