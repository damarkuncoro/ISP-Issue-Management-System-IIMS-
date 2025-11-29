
import React, { useState } from 'react';
import { Customer, UserRole, CustomerStatus, ServicePlan } from '../types';
import { ArrowLeft, User, MapPin, Phone, Mail, FileText, Server, Shield, CreditCard, Activity, Edit } from 'lucide-react';
import EditCustomerModal from './EditCustomerModal';

interface CustomerDetailProps {
  customer: Customer;
  userRole: UserRole;
  servicePlans: ServicePlan[];
  onBack: () => void;
  onUpdateCustomer: (id: string, data: any) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, userRole, servicePlans, onBack, onUpdateCustomer }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- PERMISSION LOGIC ---
  const isManager = userRole === UserRole.MANAGER;
  const isCS = userRole === UserRole.CS;
  const isNOC = userRole === UserRole.NOC || userRole === UserRole.NETWORK;
  const isProvisioning = userRole === UserRole.PROVISIONING;
  const isSales = userRole === UserRole.SALES;

  // Edit Permission: Anyone who can see details can usually request an edit, 
  // but the Modal handles specifically what they can touch.
  const canOpenEdit = isManager || isCS || isSales || isProvisioning || isNOC;

  // Personal Info Visibility
  const canViewPersonal = isManager || isCS || isSales || isProvisioning;

  // Technical Info Visibility
  const canViewTechnical = isManager || isNOC || isProvisioning;

  const renderObfuscated = (text: string) => (
    <span className="font-mono text-slate-400 tracking-widest">••••••••••</span>
  );

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case CustomerStatus.SUSPENDED: return 'bg-red-100 text-red-700 border-red-200';
      case CustomerStatus.VERIFIED: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
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
          <p className="text-slate-500 font-mono text-sm">{customer.id}</p>
        </div>
        
        {canOpenEdit && (
            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-medium"
            >
                <Edit size={16} /> Edit Customer
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Server size={20} className="text-indigo-600" /> Network Configuration
             </h3>
             
             {customer.status !== CustomerStatus.ACTIVE && customer.status !== CustomerStatus.VERIFIED ? (
                 <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-center italic">
                    Service not yet provisioned.
                 </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
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
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Hardware (ONU/ONT)</label>
                        <div className="text-sm space-y-1">
                            <p><span className="text-slate-500 w-24 inline-block">MAC Addr:</span> <span className="font-mono uppercase">{customer.onu_mac || '-'}</span></p>
                            <p><span className="text-slate-500 w-24 inline-block">OLT Port:</span> <span className="font-mono">{customer.olt_port || '-'}</span></p>
                        </div>
                    </div>
                </div>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN: Subscription & Status */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Subscription Plan</h3>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                    <h4 className="text-xl font-bold text-blue-900">{customer.package_name}</h4>
                    <p className="text-blue-700 text-sm mt-1">Fiber Optic Unlimited</p>
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
        </div>

      </div>
    </div>
  );
};

export default CustomerDetail;
