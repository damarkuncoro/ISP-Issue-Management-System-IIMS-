
import React from 'react';
import { Customer, CustomerStatus, ServicePlan } from '../../types';
import { UserPlus, TrendingUp, Users, Target, BarChart2, PieChart as PieIcon, ArrowUpRight, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface SalesDashboardProps {
  customers: Customer[];
  servicePlans: ServicePlan[];
  onAddCustomer: () => void;
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

const SalesDashboard: React.FC<SalesDashboardProps> = ({ customers, servicePlans, onAddCustomer }) => {
  // Metrics
  const leads = customers.filter(c => c.status === CustomerStatus.LEAD);
  const activeCustomers = customers.filter(c => c.status === CustomerStatus.ACTIVE);
  const totalCustomers = customers.length;
  
  // Sales Funnel Mock Data
  const funnelData = [
    { name: 'Leads', value: leads.length + activeCustomers.length + 20 }, // Mock historical
    { name: 'Verified', value: activeCustomers.length + 5 },
    { name: 'Active', value: activeCustomers.length },
  ];

  // Plan Popularity
  const planCounts = customers.reduce((acc, curr) => {
    acc[curr.package_name] = (acc[curr.package_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = Object.keys(planCounts).map(key => ({
    name: key.replace('Home Fiber ', '').replace('Dedicated ', ''),
    value: planCounts[key]
  })).sort((a,b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Welcome & Action */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Sales Overview</h2>
                <p className="text-slate-500">Track acquisition, plan performance, and growth.</p>
            </div>
            <button 
                onClick={onAddCustomer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition"
            >
                <UserPlus size={20} /> Register New Lead
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
                title="Total Leads" 
                value={leads.length} 
                subtext="Waiting for follow-up"
                icon={<Target size={24} />}
                colorClass="text-blue-600"
            />
            <StatCard 
                title="Active Subscribers" 
                value={activeCustomers.length} 
                subtext="+12% from last month"
                icon={<Users size={24} />}
                colorClass="text-green-600"
            />
             <StatCard 
                title="Conversion Rate" 
                value="68.5%" 
                subtext="Lead to Active"
                icon={<TrendingUp size={24} />}
                colorClass="text-purple-600"
            />
             <StatCard 
                title="Avg Revenue/User" 
                value="IDR 350k" 
                subtext="Est. Monthly ARPU"
                icon={<BarChart2 size={24} />}
                colorClass="text-orange-600"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Plan Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <PieIcon size={18} className="text-blue-500" /> Best Selling Plans
                </h4>
                <div className="h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={planData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {planData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                    {planData.map((entry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-slate-600">{entry.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">{entry.value} Users</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sales Growth Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-500" /> Monthly Acquisition Trend
                </h4>
                <div className="h-80 w-full min-w-0">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={[
                            { month: 'Jul', sales: 45 },
                            { month: 'Aug', sales: 52 },
                            { month: 'Sep', sales: 48 },
                            { month: 'Oct', sales: 60 },
                            { month: 'Nov', sales: 75 },
                            { month: 'Dec', sales: 90 }, // Projected
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* Recent Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-700">Recent Leads & Prospects</h4>
                <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                    View All Customers <ArrowRight size={14} />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-3">Customer Name</th>
                            <th className="px-6 py-3">Interested Plan</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Sales Agent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leads.length > 0 ? leads.slice(0, 5).map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">{lead.name}</td>
                                <td className="px-6 py-4 text-slate-600">{lead.package_name}</td>
                                <td className="px-6 py-4 text-slate-600">{lead.phone}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Draft Lead</span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{lead.sales_agent || 'Unassigned'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-6 text-slate-500">No new leads pending.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

    </div>
  );
};

export default SalesDashboard;
