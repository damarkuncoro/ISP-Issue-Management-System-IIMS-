
import React, { useState } from 'react';
import { Customer, CustomerStatus, UserRole, ServicePlan } from '../types';
import { Search, Plus, UserCheck, Network, FileCheck, MapPin, User, Settings, Eye } from 'lucide-react';

interface CustomerManagementProps {
  customers: Customer[];
  userRole: UserRole;
  servicePlans: ServicePlan[];
  onAddCustomer: (data: any) => void;
  onVerifyCustomer: (id: string, data: any) => void;
  onProvisionCustomer: (id: string, data: any) => void;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, userRole, servicePlans, onAddCustomer, onVerifyCustomer, onProvisionCustomer, onSelectCustomer }) => {
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'VERIFY' | 'PROVISION'>('ADD');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(filterText.toLowerCase()) ||
    c.id.toLowerCase().includes(filterText.toLowerCase()) ||
    c.address.toLowerCase().includes(filterText.toLowerCase())
  );

  const openModal = (mode: 'ADD' | 'VERIFY' | 'PROVISION', customer?: Customer) => {
    setModalMode(mode);
    setSelectedCustomer(customer || null);
    setFormData(customer || {});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'ADD') {
      onAddCustomer(formData);
    } else if (modalMode === 'VERIFY' && selectedCustomer) {
      onVerifyCustomer(selectedCustomer.id, formData);
    } else if (modalMode === 'PROVISION' && selectedCustomer) {
      onProvisionCustomer(selectedCustomer.id, formData);
    }
    setIsModalOpen(false);
  };

  // Roles Logic
  const canAdd = userRole === UserRole.SALES || userRole === UserRole.MANAGER;
  const canVerify = userRole === UserRole.CS || userRole === UserRole.MANAGER;
  const canProvision = userRole === UserRole.PROVISIONING || userRole === UserRole.NETWORK || userRole === UserRole.MANAGER;

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.LEAD: return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">Draft / Lead</span>;
      case CustomerStatus.VERIFIED: return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-bold">Verified</span>;
      case CustomerStatus.ACTIVE: return <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold">Active</span>;
      case CustomerStatus.SUSPENDED: return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">Suspended</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">
                  {modalMode === 'ADD' && 'Register New Customer (Lead)'}
                  {modalMode === 'VERIFY' && 'Verify Customer Identity'}
                  {modalMode === 'PROVISION' && 'Network Provisioning'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">x</button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* SALES FIELDS */}
                {(modalMode === 'ADD') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input required type="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Installation Address</label>
                      <textarea required className="w-full px-4 py-2 border rounded-lg" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Package Plan</label>
                      <select required className="w-full px-4 py-2 border rounded-lg" value={formData.package_name || ''} onChange={e => setFormData({...formData, package_name: e.target.value})}>
                         <option value="">Select Package</option>
                         {servicePlans.filter(p => p.active).map(plan => (
                             <option key={plan.id} value={plan.name}>{plan.name} ({plan.speed_mbps} Mbps)</option>
                         ))}
                      </select>
                    </div>
                  </>
                )}

                {/* CS / ADMIN FIELDS */}
                {modalMode === 'VERIFY' && (
                  <>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4">
                       Verifying data for: <strong>{selectedCustomer?.name}</strong>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">NIK / Identity Number</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="16 digit NIK" value={formData.identity_number || ''} onChange={e => setFormData({...formData, identity_number: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" id="contract" required checked={formData.contract_doc || false} onChange={e => setFormData({...formData, contract_doc: e.target.checked})} />
                       <label htmlFor="contract" className="text-sm text-slate-700">Contract Document Signed & Uploaded</label>
                    </div>
                  </>
                )}

                 {/* PROVISIONING FIELDS */}
                 {modalMode === 'PROVISION' && (
                  <>
                     <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4">
                       Provisioning for: <strong>{selectedCustomer?.name}</strong> ({selectedCustomer?.package_name})
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">PPPoE Username</label>
                        <input required type="text" className="w-full px-4 py-2 border rounded-lg font-mono text-sm" value={formData.pppoe_username || ''} onChange={e => setFormData({...formData, pppoe_username: e.target.value})} />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">VLAN ID</label>
                        <input required type="number" className="w-full px-4 py-2 border rounded-lg font-mono text-sm" value={formData.vlan_id || ''} onChange={e => setFormData({...formData, vlan_id: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assigned IP Address</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="10.x.x.x or Public IP" value={formData.ip_address || ''} onChange={e => setFormData({...formData, ip_address: e.target.value})} />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ONU MAC Address</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg font-mono text-sm uppercase" placeholder="AA:BB:CC..." value={formData.onu_mac || ''} onChange={e => setFormData({...formData, onu_mac: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">OLT Port Assignment</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="OLT-01-PON-3" value={formData.olt_port || ''} onChange={e => setFormData({...formData, olt_port: e.target.value})} />
                    </div>
                  </>
                )}

                <div className="pt-4 flex justify-end gap-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                     {modalMode === 'ADD' && 'Register Customer'}
                     {modalMode === 'VERIFY' && 'Confirm Verification'}
                     {modalMode === 'PROVISION' && 'Activate Service'}
                   </button>
                </div>

             </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Management</h2>
          <p className="text-slate-500">Sales, Verification & Provisioning Pipeline</p>
        </div>
        {canAdd && (
          <button 
            onClick={() => openModal('ADD')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
          >
            <Plus size={20} /> New Customer (Sales)
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Leads (Draft)</h4>
            <p className="text-2xl font-bold text-slate-800">{customers.filter(c => c.status === CustomerStatus.LEAD).length}</p>
         </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Pending Provisioning</h4>
            <p className="text-2xl font-bold text-blue-600">{customers.filter(c => c.status === CustomerStatus.VERIFIED).length}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Active Users</h4>
            <p className="text-2xl font-bold text-green-600">{customers.filter(c => c.status === CustomerStatus.ACTIVE).length}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Total Users</h4>
            <p className="text-2xl font-bold text-slate-800">{customers.length}</p>
         </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Name, ID, Address..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
                <tr>
                   <th className="px-6 py-4">Customer Info</th>
                   <th className="px-6 py-4">Service Plan</th>
                   <th className="px-6 py-4">Technical Details</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{customer.name}</div>
                          <div className="text-xs text-slate-500 font-mono mb-1">{customer.id}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {customer.address}</div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                            {customer.package_name}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-xs font-mono text-slate-600">
                          {customer.pppoe_username ? (
                            <>
                                <div>User: {customer.pppoe_username}</div>
                                <div>IP: {customer.ip_address}</div>
                                <div>VLAN: {customer.vlan_id}</div>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Not provisioned</span>
                          )}
                       </td>
                       <td className="px-6 py-4">
                          {getStatusBadge(customer.status)}
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex gap-2">
                             <button onClick={() => onSelectCustomer(customer)} className="text-slate-500 hover:text-blue-600 bg-slate-100 p-1.5 rounded transition" title="View Detail">
                                <Eye size={16} />
                             </button>

                             {customer.status === CustomerStatus.LEAD && canVerify && (
                                <button onClick={() => openModal('VERIFY', customer)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1">
                                    <FileCheck size={12} /> Verify
                                </button>
                             )}
                             {customer.status === CustomerStatus.VERIFIED && canProvision && (
                                <button onClick={() => openModal('PROVISION', customer)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1">
                                    <Network size={12} /> Activate
                                </button>
                             )}
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filteredCustomers.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">No customers found.</td></tr>
                 )}
              </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default CustomerManagement;
