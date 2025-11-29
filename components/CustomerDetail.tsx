
import React, { useState } from 'react';
import { Customer, UserRole, CustomerStatus, ServicePlan, Invoice, InvoiceStatus, Device, DeviceStatus } from '../types';
import { ArrowLeft, User, MapPin, Phone, Mail, FileText, Server, Shield, CreditCard, Activity, Edit, Download, CheckCircle, Clock, AlertCircle, Ticket as TicketIcon, Router, Plus, UserX } from 'lucide-react';
import EditCustomerModal from './EditCustomerModal';
import CreateTicketModal from './CreateTicketModal';
import AddDeviceModal from './AddDeviceModal';
import TerminateModal from './TerminateModal';

interface CustomerDetailProps {
  customer: Customer;
  userRole: UserRole;
  servicePlans: ServicePlan[];
  invoices?: Invoice[];
  devices?: Device[]; // Needed for Create Ticket Modal and Device List
  onBack: () => void;
  onUpdateCustomer: (id: string, data: any) => void;
  onCreateTicket?: (ticketData: any) => void;
  onAddDevice?: (deviceData: any) => void; // New Prop
  onTerminateCustomer?: (id: string, reason: string, date: string, createTicket: boolean) => void; // New Prop for termination logic
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
    customer, 
    userRole, 
    servicePlans, 
    invoices = [], 
    devices = [],
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
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');

  // --- PERMISSION LOGIC ---
  const isManager = userRole === UserRole.MANAGER;
  const isCS = userRole === UserRole.CS;
  const isNOC = userRole === UserRole.NOC || userRole === UserRole.NETWORK;
  const isProvisioning = userRole === UserRole.PROVISIONING;
  const isSales = userRole === UserRole.SALES;
  const isFinance = userRole === UserRole.FINANCE;
  const isHelpdesk = userRole === UserRole.HELPDESK;
  const isField = userRole === UserRole.FIELD;

  // Edit Permission: Anyone who can see details can usually request an edit, 
  // but the Modal handles specifically what they can touch.
  const canOpenEdit = isManager || isCS || isSales || isProvisioning || isNOC || isFinance;

  // Ticket Creation Permission
  const canCreateTicket = isManager || isCS || isHelpdesk || isNOC || isSales;

  // Device Mgmt Permission
  const canAddDevice = isManager || isNOC || isField || isProvisioning;

  // Termination Permission (Manager & CS Only)
  const canTerminate = (isManager || isCS) && customer.status !== CustomerStatus.TERMINATED;

  // Personal Info Visibility
  const canViewPersonal = isManager || isCS || isSales || isProvisioning || isFinance || isHelpdesk || isField;

  // Technical Info Visibility
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

  // Relational Data: Get Plan Details
  const customerPlan = servicePlans.find(p => p.id === customer.service_plan_id) || servicePlans.find(p => p.name === customer.package_name);

  const handleTicketSubmit = (data: any) => {
      if (onCreateTicket) {
          onCreateTicket(data);
      }
      setIsTicketModalOpen(false);
  };

  const handleDeviceSubmit = (data: any) => {
      if (onAddDevice) {
          onAddDevice(data);
      }
      setIsDeviceModalOpen(false);
  };

  const handleTerminationConfirm = (reason: string, date: string, createTicket: boolean) => {
      if (onTerminateCustomer) {
          onTerminateCustomer(customer.id, reason, date, createTicket);
      }
  };

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
            customers={[customer]} // Only relevant to this customer
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
            customers={[customer]} // Pass just this customer for auto-select logic
            preSelectedCustomerId={customer.id}
            allDevices={devices} // Pass all devices for Uplink selection
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
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {customer.name}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
              <p className="text-slate-500 font-mono text-sm">{customer.id}</p>
              
              {canViewPersonal && (
                  <>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
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
                    <Edit size={16} /> Edit Customer
                </button>
            )}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-4 border-b border-slate-200">
          <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Profile & Network
          </button>
          <button 
             onClick={() => setActiveTab('billing')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Billing History
          </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
        
        {/* LEFT COLUMN: Personal & Account Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
             {!canViewPersonal && (
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="bg-white px-4 py-2 rounded-lg shadow border border-slate-200 text-slate-500 text-sm font-medium flex items-center gap-2">
                        <Shield size={16} /> Personal Data Restricted for {userRole}
                    </div>
                </div>
             )}
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Customer Profile
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
                        <p className="text-slate-800 font-medium">{customer.name}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
                        <div className="flex items-center gap-2 text-slate-700">
                            <Mail size={14} />
                            {canViewPersonal ? customer.email : renderObfuscated('')}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Phone Number</label>
                        <div className="flex items-center gap-2 text-slate-700">
                            <Phone size={14} />
                            {canViewPersonal ? customer.phone : renderObfuscated('')}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                     <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Identity Number (NIK)</label>
                        <p className="font-mono text-slate-700">
                            {canViewPersonal ? (customer.identity_number || '-') : renderObfuscated('')}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Installation Address</label>
                        <div className="flex items-start gap-2 text-slate-700">
                            <MapPin size={14} className="mt-1" />
                            <p>{canViewPersonal ? customer.address : 'Location Hidden'}</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Technical Info Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
             {!canViewTechnical && (
                <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                    <div className="bg-white px-4 py-2 rounded-lg shadow border border-slate-200 text-slate-500 text-sm font-medium flex items-center gap-2">
                        <Shield size={16} /> Technical Configuration Restricted for {userRole}
                    </div>
                </div>
             )}
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Server size={20} className="text-indigo-600" /> Network Configuration
                 </h3>
                 {canAddDevice && onAddDevice && (
                     <button onClick={() => setIsDeviceModalOpen(true)} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition">
                         <Plus size={14} /> Add Device
                     </button>
                 )}
             </div>
             
             {/* Logical Config (PPPoE/IP) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-6 border-b border-slate-100 pb-6">
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">PPPoE Credentials</label>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Username:</span>
                            <span className="font-mono font-medium">{customer.pppoe_username || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Password:</span>
                            <span className="font-mono text-slate-400">••••••••</span>
                        </div>
                    </div>
                </div>
                <div>
                     <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">IP Allocation</label>
                     <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">IP Address:</span>
                            <span className="font-mono font-medium text-indigo-700">{customer.ip_address || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">VLAN ID:</span>
                            <span className="font-mono font-medium">{customer.vlan_id || '-'}</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Physical Devices List */}
             <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase block mb-3">Linked Devices (CPE)</label>
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
                                         <p className="text-xs text-slate-500">{device.model} • SN: {device.serial_number}</p>
                                         {device.uplink_device_id && (
                                             <p className="text-[10px] text-purple-600 font-medium">Uplink: {device.uplink_device_id}</p>
                                         )}
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-mono text-indigo-600">{device.ip_address || 'No IP'}</p>
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${device.status === DeviceStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                         {device.status}
                                     </span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center">
                         No physical devices linked to this account.
                     </div>
                 )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Subscription & Status */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Subscription Plan</h3>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                    {customerPlan ? (
                        <>
                            <h4 className="text-xl font-bold text-blue-900">{customerPlan.name}</h4>
                            <p className="text-blue-700 text-sm mt-1">{customerPlan.speed_mbps} Mbps | {customerPlan.category}</p>
                            <p className="text-blue-600/80 text-xs mt-1">{formatCurrency(customerPlan.price)}/mo</p>
                        </>
                    ) : (
                        <>
                            <h4 className="text-xl font-bold text-blue-900">{customer.package_name}</h4>
                            <p className="text-blue-700 text-sm mt-1">Legacy Plan</p>
                        </>
                    )}
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                        <span className="text-slate-500">Registration Date</span>
                        <span className="font-medium text-slate-800">{new Date(customer.registered_at).toLocaleDateString()}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-slate-500">Sales Agent</span>
                        <span className="font-medium text-slate-800">{customer.sales_agent || '-'}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-slate-500">Contract Status</span>
                        <span className="font-medium text-green-600 flex items-center gap-1">
                             <FileText size={14} /> {customer.contract_doc ? 'Signed' : 'Pending'}
                        </span>
                    </li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Live Diagnostics</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${customer.status === CustomerStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                             <span className="text-sm font-medium text-slate-700">Online Status</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                            {customer.status === CustomerStatus.ACTIVE ? 'Connected' : 'Offline'}
                        </span>
                    </div>
                    {canViewTechnical && customer.status === CustomerStatus.ACTIVE && (
                        <>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-slate-400"/>
                                    <span className="text-sm font-medium text-slate-700">Optical Power</span>
                                </div>
                                <span className="text-xs font-mono text-green-600 font-bold">-18.4 dBm</span>
                            </div>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-slate-400"/>
                                    <span className="text-sm font-medium text-slate-700">Last Session</span>
                                </div>
                                <span className="text-xs font-mono text-slate-600">4d 2h 15m</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* DANGER ZONE - TERMINATION */}
            {canTerminate && (
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <UserX size={16} /> Danger Zone
                    </h3>
                    <p className="text-xs text-red-600 mb-4">
                        Terminate this customer subscription. This action will schedule a service stop and asset retrieval.
                    </p>
                    <button 
                        onClick={() => setIsTerminateModalOpen(true)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm shadow-sm transition"
                    >
                        Stop Subscription
                    </button>
                </div>
            )}
        </div>
      </div>
      )}

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <CreditCard size={20} className="text-green-600" /> Invoice History
                  </h3>
                  <button className="text-blue-600 text-sm font-medium hover:underline">Download Statement</button>
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
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No invoices generated yet.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

    </div>
  );
};

export default CustomerDetail;
