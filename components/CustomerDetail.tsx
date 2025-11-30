
import React, { useState } from 'react';
import { Customer, UserRole, CustomerStatus, ServicePlan, Invoice, InvoiceStatus, Device, DeviceStatus, Ticket, TicketStatus } from '../types';
import { ArrowLeft, User, MapPin, Phone, Mail, FileText, Server, Shield, CreditCard, Activity, Edit, Download, CheckCircle, Clock, AlertCircle, Ticket as TicketIcon, Router, Plus, UserX, BarChart2, AlertTriangle, ExternalLink, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import EditCustomerModal from './EditCustomerModal';
import CreateTicketModal from './CreateTicketModal';
import AddDeviceModal from './AddDeviceModal';
import TerminateModal from './TerminateModal';

interface CustomerDetailProps {
  customer: Customer;
  userRole: UserRole;
  servicePlans: ServicePlan[];
  invoices?: Invoice[];
  devices?: Device[]; 
  tickets?: Ticket[]; // Added tickets prop
  onBack: () => void;
  onUpdateCustomer: (id: string, data: any) => void;
  onCreateTicket?: (ticketData: any) => void;
  onAddDevice?: (deviceData: any) => void;
  onTerminateCustomer?: (id: string, reason: string, date: string, createTicket: boolean) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
    customer, 
    userRole, 
    servicePlans, 
    invoices = [], 
    devices = [],
    tickets = [],
    onBack, 
    onUpdateCustomer,
    onCreateTicket,
    onAddDevice,
    onTerminateCustomer
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'tickets' | 'billing'>('profile');

  // --- PERMISSION LOGIC ---
  const isManager = userRole === UserRole.MANAGER;
  const isCS = userRole === UserRole.CS;
  const isNOC = userRole === UserRole.NOC || userRole === UserRole.NETWORK;
  const isProvisioning = userRole === UserRole.PROVISIONING;
  const isSales = userRole === UserRole.SALES;
  const isFinance = userRole === UserRole.FINANCE;
  const isHelpdesk = userRole === UserRole.HELPDESK;
  const isField = userRole === UserRole.FIELD;

  const canOpenEdit = isManager || isCS || isSales || isProvisioning || isNOC || isFinance;
  const canCreateTicket = isManager || isCS || isHelpdesk || isNOC || isSales;
  const canAddDevice = isManager || isNOC || isField || isProvisioning;
  const canTerminate = (isManager || isCS) && customer.status !== CustomerStatus.TERMINATED;
  const canViewPersonal = isManager || isCS || isSales || isProvisioning || isFinance || isHelpdesk || isField;
  const canViewTechnical = isManager || isNOC || isProvisioning || isField;

  const renderObfuscated = (text: string) => (
    <span className="font-mono text-slate-400 tracking-widest">••••••••••</span>
  );

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case CustomerStatus.SUSPENDED: return 'bg-red-100 text-red-700 border-red-200';
      case CustomerStatus.VERIFIED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case CustomerStatus.TERMINATED: return 'bg-slate-800 text-slate-200 border-slate-600';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  const getInvoiceStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"><CheckCircle size={10}/> Paid</span>;
      case InvoiceStatus.UNPAID: return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"><Clock size={10}/> Unpaid</span>;
      case InvoiceStatus.OVERDUE: return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"><AlertCircle size={10}/> Overdue</span>;
      default: return null;
    }
  };

  const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
  const customerDevices = devices.filter(d => d.customer_id === customer.id);
  // Find tickets linked to this customer
  const customerTickets = tickets.filter(t => t.link_id === customer.id);

  const customerPlan = servicePlans.find(p => p.id === customer.service_plan_id) || servicePlans.find(p => p.name === customer.package_name);

  // Mock Usage Data
  const usageData = [
      { day: 'Mon', usage: 12.5 }, { day: 'Tue', usage: 15.2 }, { day: 'Wed', usage: 8.4 }, { day: 'Thu', usage: 22.1 }, 
      { day: 'Fri', usage: 18.9 }, { day: 'Sat', usage: 14.5 }, { day: 'Sun', usage: 10.2 }
  ];

  const handleTicketSubmit = (data: any) => {
      if (onCreateTicket) onCreateTicket(data);
      setIsTicketModalOpen(false);
  };

  const handleDeviceSubmit = (data: any) => {
      if (onAddDevice) onAddDevice(data);
      setIsDeviceModalOpen(false);
  };

  const handleTerminationConfirm = (reason: string, date: string, createTicket: boolean) => {
      if (onTerminateCustomer) onTerminateCustomer(customer.id, reason, date, createTicket);
  };

  // --- HEALTH SCORE CALCULATION ---
  const calculateHealthScore = () => {
      let score = 100;
      
      // Deduct for active tickets
      const activeTickets = customerTickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);
      score -= (activeTickets.length * 15);

      // Deduct for overdue invoices
      const overdue = customerInvoices.filter(i => i.status === InvoiceStatus.OVERDUE);
      score -= (overdue.length * 20);

      // Deduct for resolved tickets in last 30 days (Recurring issues)
      // Mock check: assume half of closed tickets are recent
      const closedTickets = customerTickets.length - activeTickets.length;
      score -= (closedTickets * 5);

      return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  const riskLevel = healthScore > 80 ? 'Low' : healthScore > 50 ? 'Medium' : 'High';
  const riskColor = healthScore > 80 ? '#22c55e' : healthScore > 50 ? '#f59e0b' : '#ef4444'; // Green, Orange, Red

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      {isEditModalOpen && (
        <EditCustomerModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={customer}
          userRole={userRole}
          servicePlans={servicePlans}
          onUpdate={onUpdateCustomer}
        />
      )}

      {isTicketModalOpen && onCreateTicket && (
          <CreateTicketModal 
            isOpen={isTicketModalOpen}
            onClose={() => setIsTicketModalOpen(false)}
            onSubmit={handleTicketSubmit}
            customers={[customer]} 
            devices={devices}
            preSelectedCustomer={customer}
          />
      )}

      {isDeviceModalOpen && onAddDevice && (
          <AddDeviceModal
            isOpen={isDeviceModalOpen}
            onClose={() => setIsDeviceModalOpen(false)}
            onSubmit={handleDeviceSubmit}
            userRole={userRole}
            customers={[customer]}
            preSelectedCustomerId={customer.id}
            allDevices={devices}
          />
      )}

      {isTerminateModalOpen && onTerminateCustomer && (
          <TerminateModal
            isOpen={isTerminateModalOpen}
            onClose={() => setIsTerminateModalOpen(false)}
            onConfirm={handleTerminationConfirm}
            customerName={customer.name}
          />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">{customer.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1 text-sm">
              <p className="text-slate-500 font-mono">{customer.id}</p>
              {canViewPersonal && (
                  <>
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span>{customer.email}</span>
                    </div>
                  </>
              )}
          </div>
        </div>
        
        <div className="flex gap-2">
            {canCreateTicket && onCreateTicket && (
                <button 
                    onClick={() => setIsTicketModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-medium"
                >
                    <TicketIcon size={16} /> Create Ticket
                </button>
            )}
            
            {canOpenEdit && (
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-medium"
                >
                    <Edit size={16} /> Edit
                </button>
            )}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-4 border-b border-slate-200">
          <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <User size={16} /> Profile & Network
          </button>
          <button 
             onClick={() => setActiveTab('tickets')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'tickets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <TicketIcon size={16} /> Ticket History
             {customerTickets.length > 0 && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">{customerTickets.length}</span>}
          </button>
          <button 
             onClick={() => setActiveTab('billing')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <CreditCard size={16} /> Billing
          </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
        
        {/* LEFT COLUMN: Personal & Technical */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Account Details
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Address</label>
                        <div className="flex items-start gap-2 text-slate-700 mt-1">
                            <MapPin size={16} className="mt-0.5 text-slate-400" />
                            <p>{canViewPersonal ? customer.address : 'Location Hidden'}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Registration</label>
                        <div className="flex items-center gap-2 text-slate-700 mt-1">
                            <Clock size={16} className="text-slate-400" />
                            <p>{new Date(customer.registered_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                     <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Identity (NIK)</label>
                        <p className="font-mono text-slate-700 mt-1">
                            {canViewPersonal ? (customer.identity_number || '-') : renderObfuscated('')}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Contract Status</label>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                             <FileText size={12} /> {customer.contract_doc ? 'Signed & Valid' : 'Pending'}
                        </span>
                    </div>
                </div>
             </div>
          </div>

          {/* Technical Info Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Server size={20} className="text-indigo-600" /> Network Provisioning
                 </h3>
                 {canAddDevice && onAddDevice && (
                     <button onClick={() => setIsDeviceModalOpen(true)} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition">
                         <Plus size={14} /> Add Device
                     </button>
                 )}
             </div>
             
             {!canViewTechnical ? (
                 <div className="bg-slate-50 p-8 text-center text-slate-500 rounded-lg">
                     <Shield size={24} className="mx-auto mb-2 text-slate-400" />
                     <p>Technical details hidden for this role.</p>
                 </div>
             ) : (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">AAA / PPPoE</label>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Username:</span>
                                    <span className="font-mono font-medium text-slate-800">{customer.pppoe_username || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Password:</span>
                                    <span className="font-mono text-slate-400">••••••••</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">IP Allocation</label>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Static IP:</span>
                                    <span className="font-mono font-medium text-indigo-700">{customer.ip_address || 'Dynamic'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">VLAN ID:</span>
                                    <span className="font-mono font-medium">{customer.vlan_id || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Customer Premises Equipment (CPE)</label>
                        {customerDevices.length > 0 ? (
                            <div className="space-y-3">
                                {customerDevices.map(device => (
                                    <div key={device.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${device.status === DeviceStatus.ACTIVE ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <Router size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{device.name}</p>
                                                <p className="text-xs text-slate-500">{device.model} • {device.serial_number}</p>
                                                {device.uplink_device_id && (
                                                    <p className="text-[10px] text-purple-600 font-medium flex items-center gap-1 mt-0.5">
                                                        <Activity size={10} /> Uplink: {device.uplink_device_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-mono text-indigo-600 mb-1">{device.ip_address || 'No IP'}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${device.status === DeviceStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {device.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center border border-dashed border-slate-200">
                                No physical devices linked. Use "Add Device" to register an ONU.
                            </div>
                        )}
                    </div>
                 </>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN: Subscription & Insights */}
        <div className="space-y-6">
            
            {/* Churn Risk / Health Score Card */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden ${
                riskLevel === 'High' ? 'ring-2 ring-red-100' : ''
            }`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <HeartPulse size={16} className={riskLevel === 'High' ? 'text-red-500' : 'text-green-500'} /> Health Score
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 ${
                        riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                        {riskLevel} Risk
                    </span>
                </div>
                
                <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} 
                                data={[{ value: healthScore }]} 
                                startAngle={180} endAngle={0}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background dataKey="value" cornerRadius={10} fill={riskColor} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                            <span className="text-3xl font-bold text-slate-800">{healthScore}</span>
                            <span className="text-[10px] text-slate-400 uppercase">Score</span>
                        </div>
                    </div>
                </div>
                
                {riskLevel === 'High' && (
                    <div className="mt-4 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100 text-center">
                        Warning: High churn probability due to recent unresolved tickets.
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Current Plan</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-xl mb-4">
                    {customerPlan ? (
                        <>
                            <div className="flex justify-between items-start">
                                <h4 className="text-xl font-bold text-blue-900">{customerPlan.name}</h4>
                                <span className="text-[10px] bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">{customerPlan.category}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-bold text-blue-700">{customerPlan.speed_mbps}</span>
                                <span className="text-sm text-blue-600 font-medium">Mbps</span>
                            </div>
                            <p className="text-blue-600/80 text-xs mt-2 font-medium">{formatCurrency(customerPlan.price)}/mo</p>
                        </>
                    ) : (
                        <>
                            <h4 className="text-xl font-bold text-blue-900">{customer.package_name}</h4>
                            <p className="text-blue-700 text-sm mt-1">Legacy Plan</p>
                        </>
                    )}
                </div>
            </div>

            {/* Service Health */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Service Health</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${customer.status === CustomerStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                             <span className="text-sm font-medium text-slate-700">Radius Session</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                            {customer.status === CustomerStatus.ACTIVE ? 'Connected' : 'Offline'}
                        </span>
                    </div>
                    {canViewTechnical && customer.status === CustomerStatus.ACTIVE && (
                        <>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-indigo-500"/>
                                    <span className="text-sm font-medium text-slate-700">Optical Power</span>
                                </div>
                                <span className="text-xs font-mono text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">-18.4 dBm</span>
                            </div>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-blue-500"/>
                                    <span className="text-sm font-medium text-slate-700">Session Time</span>
                                </div>
                                <span className="text-xs font-mono text-slate-600">4d 2h 15m</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Usage Analytics */}
            {canViewTechnical && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <BarChart2 size={16} /> Data Usage (7 Days)
                    </h3>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={usageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    formatter={(val) => [`${val} GB`, 'Usage']}
                                />
                                <Bar dataKey="usage" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={20} />
                                <ReferenceLine y={20} stroke="#f97316" strokeDasharray="3 3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Total: 102 GB</span>
                        <span>FUP: {customerPlan?.fup_quota_gb ? `${customerPlan.fup_quota_gb} GB` : 'Unlimited'}</span>
                    </div>
                </div>
            )}

            {/* DANGER ZONE - TERMINATION */}
            {canTerminate && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <UserX size={16} /> Danger Zone
                    </h3>
                    <button 
                        onClick={() => setIsTerminateModalOpen(true)}
                        className="w-full bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2 rounded-lg text-sm shadow-sm transition"
                    >
                        Stop Subscription
                    </button>
                </div>
            )}
        </div>
      </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <TicketIcon size={20} className="text-blue-600" /> Support History
                      </h3>
                      <p className="text-sm text-slate-500">All incidents linked to this customer account.</p>
                  </div>
                  <button onClick={() => setIsTicketModalOpen(true)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded font-medium transition">
                      + New Ticket
                  </button>
              </div>
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                      <tr>
                          <th className="px-6 py-4">Ticket ID</th>
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4">Created</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Severity</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {customerTickets.length > 0 ? (
                          customerTickets.map(ticket => (
                              <tr key={ticket.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 font-mono text-slate-700 text-xs">{ticket.id}</td>
                                  <td className="px-6 py-4 font-medium text-slate-800">{ticket.title}</td>
                                  <td className="px-6 py-4 text-slate-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                          ticket.status === TicketStatus.OPEN ? 'bg-red-100 text-red-700 border-red-200' :
                                          ticket.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-700 border-green-200' :
                                          'bg-blue-100 text-blue-700 border-blue-200'
                                      }`}>
                                          {ticket.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`text-xs font-medium ${ticket.severity === 'Critical' ? 'text-red-600' : 'text-slate-600'}`}>
                                          {ticket.severity}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No support tickets found for this customer.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <CreditCard size={20} className="text-green-600" /> Invoice History
                  </h3>
                  <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                      <FileText size={14} /> Download Statement
                  </button>
              </div>
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                      <tr>
                          <th className="px-6 py-4">Invoice ID</th>
                          <th className="px-6 py-4">Issue Date</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Due Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {customerInvoices.length > 0 ? (
                          customerInvoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 font-mono text-slate-700">{inv.id}</td>
                                  <td className="px-6 py-4 text-slate-600">{new Date(inv.issue_date).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(inv.amount)}</td>
                                  <td className="px-6 py-4 text-slate-600">{new Date(inv.due_date).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                      {getInvoiceStatusBadge(inv.status)}
                                  </td>
                                  <td className="px-6 py-4">
                                      <button className="text-slate-500 hover:text-blue-600 p-1.5 rounded transition bg-slate-100" title="Download PDF">
                                          <Download size={14} />
                                      </button>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No invoices generated yet.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

    </div>
  );
};

export default CustomerDetail;
