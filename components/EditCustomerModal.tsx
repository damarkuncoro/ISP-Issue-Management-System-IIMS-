
import React, { useState, useEffect } from 'react';
import { Customer, UserRole, ServicePlan, CustomerStatus } from '../types';
import { X, Save, Shield, User, Server, CreditCard } from 'lucide-react';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  userRole: UserRole;
  servicePlans: ServicePlan[];
  onUpdate: (id: string, data: any) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  customer, 
  userRole, 
  servicePlans, 
  onUpdate 
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    }
  }, [customer]);

  if (!isOpen) return null;

  // --- PERMISSION LOGIC ---
  const isManager = userRole === UserRole.MANAGER;
  
  // 1. CS / Basic Edit: Name, Phone, Email, Address
  const canEditPersonal = isManager || userRole === UserRole.CS || userRole === UserRole.SALES;

  // 2. Billing / Admin Edit: Package, Status
  const canEditBilling = isManager || userRole === UserRole.SALES; 

  // 3. Technical Edit: IP, VLAN, PPPoE, MAC
  const canEditTechnical = isManager || userRole === UserRole.PROVISIONING || userRole === UserRole.NETWORK || userRole === UserRole.NOC;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(customer.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <div>
             <h3 className="text-xl font-bold text-slate-800">Edit Customer Data</h3>
             <p className="text-xs text-slate-500">Editing as <span className="font-semibold text-blue-600">{userRole}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* SECTION 1: PERSONAL INFO (CS) */}
          <div className={`p-4 rounded-xl border ${canEditPersonal ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
             <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <User size={16} className="text-blue-500" /> Personal Information
                {!canEditPersonal && <Shield size={12} className="text-slate-400" />}
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.name || ''}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     disabled={!canEditPersonal}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Identity Number (NIK)</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.identity_number || ''}
                     onChange={e => setFormData({...formData, identity_number: e.target.value})}
                     disabled={!canEditPersonal}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                   <input 
                     type="email" 
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.email || ''}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                     disabled={!canEditPersonal}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.phone || ''}
                     onChange={e => setFormData({...formData, phone: e.target.value})}
                     disabled={!canEditPersonal}
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-medium text-slate-500 mb-1">Installation Address</label>
                   <textarea 
                     rows={2}
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.address || ''}
                     onChange={e => setFormData({...formData, address: e.target.value})}
                     disabled={!canEditPersonal}
                   />
                </div>
             </div>
          </div>

          {/* SECTION 2: BILLING & PACKAGE (ADMIN/SALES) */}
          <div className={`p-4 rounded-xl border ${canEditBilling ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
             <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-green-500" /> Subscription & Status
                {!canEditBilling && <Shield size={12} className="text-slate-400" />}
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Service Package</label>
                   <select 
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.package_name || ''}
                     onChange={e => {
                        const selectedPlan = servicePlans.find(p => p.name === e.target.value);
                        setFormData({
                            ...formData, 
                            package_name: e.target.value,
                            service_plan_id: selectedPlan ? selectedPlan.id : formData.service_plan_id
                        });
                     }}
                     disabled={!canEditBilling}
                   >
                     {servicePlans.map(plan => (
                        <option key={plan.id} value={plan.name}>{plan.name}</option>
                     ))}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Account Status</label>
                   <select 
                     className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.status || ''}
                     onChange={e => setFormData({...formData, status: e.target.value as CustomerStatus})}
                     disabled={!canEditBilling}
                   >
                     {Object.values(CustomerStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                     ))}
                   </select>
                </div>
             </div>
          </div>

          {/* SECTION 3: TECHNICAL CONFIG (PROVISIONING/NOC) */}
          <div className={`p-4 rounded-xl border ${canEditTechnical ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
             <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Server size={16} className="text-indigo-500" /> Network Configuration
                {!canEditTechnical && <Shield size={12} className="text-slate-400" />}
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">PPPoE Username</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.pppoe_username || ''}
                     onChange={e => setFormData({...formData, pppoe_username: e.target.value})}
                     disabled={!canEditTechnical}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">IP Address</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.ip_address || ''}
                     onChange={e => setFormData({...formData, ip_address: e.target.value})}
                     disabled={!canEditTechnical}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">VLAN ID</label>
                   <input 
                     type="number" 
                     className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.vlan_id || ''}
                     onChange={e => setFormData({...formData, vlan_id: Number(e.target.value)})}
                     disabled={!canEditTechnical}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">OLT Port</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                     value={formData.olt_port || ''}
                     onChange={e => setFormData({...formData, olt_port: e.target.value})}
                     disabled={!canEditTechnical}
                   />
                </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-medium text-slate-500 mb-1">ONU/ONT MAC Address</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 uppercase"
                     value={formData.onu_mac || ''}
                     onChange={e => setFormData({...formData, onu_mac: e.target.value})}
                     disabled={!canEditTechnical}
                   />
                </div>
             </div>
          </div>
          
        </form>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-bold shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;