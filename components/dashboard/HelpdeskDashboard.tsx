import React, { useState } from 'react';
import { Ticket, TicketType, TicketStatus, Severity, Customer, Device, Invoice, Maintenance } from '../../types';
import { Phone, Clock, AlertCircle, Search, MapPin, CheckCircle, XCircle, ArrowRight, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import CreateTicketModal from '../CreateTicketModal';

interface HelpdeskDashboardProps {
  tickets: Ticket[];
  customers: Customer[];
  devices: Device[];
  invoices: Invoice[];
  maintenance: Maintenance[];
  onCreateTicket: (data: any) => void;
  onNavigateToTicket: (ticket: Ticket) => void;
  onViewAllTickets: () => void;
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

const HelpdeskDashboard: React.FC<HelpdeskDashboardProps> = ({ tickets, customers, devices, invoices, maintenance, onCreateTicket, onNavigateToTicket, onViewAllTickets }) => {
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Coverage Tool State
  const [coverageAddress, setCoverageAddress] = useState('');
  const [coverageStatus, setCoverageStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  const customerTickets = tickets.filter(t => t.type === TicketType.CUSTOMER);
  const activeComplaints = customerTickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);
  
  // Identify mass outages (Parent tickets)
  const massOutage = tickets.find(t => t.impact_users > 500 && t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);

  const typeData = [
    { name: 'Connection', value: 45, color: '#3b82f6' },
    { name: 'Speed', value: 30, color: '#f59e0b' },
    { name: 'Billing', value: 15, color: '#10b981' },
    { name: 'Router', value: 10, color: '#8b5cf6' },
  ];

  const handleCheckCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    setCoverageStatus('checking');
    
    // Simulate API Call
    setTimeout(() => {
      // Randomly decide availability for demo purposes
      const isAvailable = Math.random() > 0.3;
      setCoverageStatus(isAvailable ? 'available' : 'unavailable');
    }, 1500);
  };

  const handleCreateSubmit = (data: any) => {
    onCreateTicket(data);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <CreateTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateSubmit} 
        customers={customers}
        devices={devices}
        invoices={invoices}
        maintenance={maintenance}
      />

      {/* Coverage Modal */}
      {isCoverageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Fiber Coverage Check</h3>
              <button onClick={() => { setIsCoverageModalOpen(false); setCoverageStatus('idle'); setCoverageAddress(''); }} className="text-slate-400 hover:text-slate-600">
                <Search size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCheckCoverage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter Customer Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Jl. Sudirman No. 45, Jakarta"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={coverageAddress}
                      onChange={(e) => setCoverageAddress(e.target.value)}
                    />
                  </div>
                </div>
                
                {coverageStatus === 'idle' && (
                   <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                     Check Availability
                   </button>
                )}

                {coverageStatus === 'checking' && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Querying ODP Database...</p>
                  </div>
                )}

                {coverageStatus === 'available' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-in fade-in">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <h4 className="font-bold text-green-800">Service Available!</h4>
                    <p className="text-sm text-green-700 mt-1">Nearest ODP: <span className="font-mono">ODP-JKT-SEL-04 (45m)</span></p>
                    <p className="text-xs text-slate-500 mt-2">Ports Available: 4/16</p>
                    <button onClick={() => { setIsCoverageModalOpen(false); setIsCreateModalOpen(true); }} className="mt-3 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
                      Proceed to Registration
                    </button>
                  </div>
                )}

                {coverageStatus === 'unavailable' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center animate-in fade-in">
                    <XCircle className="mx-auto text-red-500 mb-2" size={32} />
                    <h4 className="font-bold text-red-800">Out of Coverage</h4>
                    <p className="text-sm text-red-700 mt-1">This location is too far from existing Fiber Lines.</p>
                    <p className="text-xs text-slate-500 mt-2">Distance to Nearest ODP: 450m (Max 250m)</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Helpdesk Command Center</h2>
          <p className="opacity-90 text-lg mb-6 max-w-2xl">Manage customer inquiries, check network coverage, and respond to incidents efficiently.</p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-50 transition flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> Create New Ticket
            </button>
            <button 
              onClick={() => setIsCoverageModalOpen(true)}
              className="bg-blue-800/50 backdrop-blur-sm border border-blue-400/50 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-800/70 transition flex items-center gap-2"
            >
              <Search size={20} /> Check Coverage
            </button>
          </div>
        </div>
        <Phone className="absolute right-10 top-1/2 -translate-y-1/2 text-white/10 w-64 h-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard title="Active Complaints" value={activeComplaints.length} subtext="Requires follow-up" icon={<Phone size={24} />} colorClass="text-blue-600" />
            <StatCard title="Avg Response Time" value="2m 15s" subtext="Within SLA target" icon={<Clock size={24} />} colorClass="text-green-600" />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-slate-700">Recent Customer Tickets</h4>
              <button onClick={onViewAllTickets} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Issue</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerTickets.slice(0, 5).map(t => (
                  <tr 
                    key={t.id} 
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => onNavigateToTicket(t)}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{t.location}</td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-xs">{t.title}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                        t.status === TicketStatus.OPEN ? 'bg-red-100 text-red-700' :
                        t.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {customerTickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">No active customer tickets.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Alerts & Charts */}
        <div className="space-y-6">
          {massOutage ? (
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm animate-pulse">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-orange-800 text-lg mb-1">Mass Outage Alert</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Confirmed outage in <span className="font-bold">{massOutage.location}</span> affecting {massOutage.impact_users} users.
                  </p>
                  <button 
                    onClick={() => onNavigateToTicket(massOutage)}
                    className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 transition"
                  >
                    View Parent Ticket #{massOutage.id}
                  </button>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-green-50 p-5 rounded-xl border border-green-200 flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                    <h4 className="font-bold text-green-800">Network Stable</h4>
                    <p className="text-sm text-green-700">No mass outages detected.</p>
                </div>
             </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-4">Complaint Categories</h4>
            <div className="h-48 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                {typeData.map((item) => (
                    <div key={item.name} className="flex items-center text-xs text-slate-600">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                    </div>
                ))}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-xl p-6 text-white text-center">
             <h4 className="font-bold mb-2">Need Assistance?</h4>
             <p className="text-sm text-indigo-200 mb-4">Call the L2 Engineer On-Duty directly.</p>
             <div className="bg-indigo-800 py-2 rounded-lg font-mono text-lg font-bold">Ext. 4022</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpdeskDashboard;