import React, { useState, useEffect } from 'react';
import { TicketType, Severity, Customer, Device, Invoice, Maintenance } from '../types';
import { X, Save, Search, User, Server, AlertTriangle, FileText, Wrench } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: any) => void;
  customers: Customer[];
  devices: Device[];
  invoices?: Invoice[]; // Relational Data
  maintenance?: Maintenance[]; // Relational Data
  preSelectedCustomer?: Customer;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  customers, 
  devices, 
  invoices = [], 
  maintenance = [],
  preSelectedCustomer 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: TicketType.NETWORK,
    severity: Severity.MINOR,
    location: '',
    impact_users: 0,
    description: '',
    sla_deadline: '',
    link_id: '',
    device_id: '',
    related_invoice_id: '',
    related_maintenance_id: ''
  });

  // Smart Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    // Set default SLA to +4 hours from now
    const date = new Date();
    date.setHours(date.getHours() + 4);
    const defaultSLA = date.toISOString().slice(0, 16); // format for datetime-local
    setFormData(prev => ({ ...prev, sla_deadline: defaultSLA }));

    // Auto-fill if preSelectedCustomer is provided
    if (preSelectedCustomer && isOpen) {
        handleSelectCustomer(preSelectedCustomer);
    }
  }, [isOpen, preSelectedCustomer]);

  if (!isOpen) return null;

  // --- AUTO FILL LOGIC ---
  const handleSelectCustomer = (customer: Customer) => {
      setFormData(prev => ({
          ...prev,
          title: `Complaint: ${customer.name} - No Connection`,
          type: TicketType.CUSTOMER,
          location: customer.address,
          impact_users: 1,
          description: `Customer ID: ${customer.id}\nPackage: ${customer.package_name}\nReported Issue: Cannot browse internet.`,
          link_id: customer.id
      }));
      setShowResults(false);
      setSearchTerm('');
  };

  const handleSelectDevice = (device: Device) => {
      // Heuristic Impact Calculation
      let impact = 0;
      let severity = Severity.MINOR;
      
      if (device.type === 'Router') { impact = 1000; severity = Severity.CRITICAL; }
      else if (device.type === 'OLT') { impact = 250; severity = Severity.MAJOR; }
      else if (device.type === 'Switch') { impact = 50; severity = Severity.MAJOR; }

      setFormData(prev => ({
          ...prev,
          title: `${device.name} Down`,
          type: TicketType.DEVICE,
          location: device.location,
          impact_users: impact,
          severity: severity,
          description: `Device ID: ${device.id}\nModel: ${device.model}\nIP: ${device.ip_address}\nStatus: Unreachable via SNMP.`,
          device_id: device.id
      }));
      setShowResults(false);
      setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
        title: '',
        type: TicketType.NETWORK,
        severity: Severity.MINOR,
        location: '',
        impact_users: 0,
        description: '',
        sla_deadline: '',
        link_id: '',
        device_id: '',
        related_invoice_id: '',
        related_maintenance_id: ''
    });
  };

  const filteredCustomers = searchTerm ? customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3) : [];
  const filteredDevices = searchTerm ? devices.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.ip_address.includes(searchTerm)).slice(0, 3) : [];

  // Logic for Relational Dropdowns
  const showInvoiceSelect = (formData.type === TicketType.BILLING || formData.type === TicketType.CUSTOMER) && formData.link_id;
  const showMaintenanceSelect = formData.type === TicketType.INFRASTRUCTURE || formData.type === TicketType.NETWORK;

  // Filter invoices for selected customer
  const relatedInvoices = showInvoiceSelect ? invoices.filter(i => i.customer_id === formData.link_id) : [];
  
  // Active maintenance
  const activeMaintenance = maintenance.filter(m => m.status !== 'Completed' && m.status !== 'Cancelled');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800">Create New Ticket</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* SMART SEARCH BAR - Hide if pre-selected */}
          {!preSelectedCustomer && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 relative">
                <label className="block text-xs font-bold text-blue-700 mb-2 uppercase flex items-center gap-2">
                   <Search size={12} /> Smart Auto-Fill
                </label>
                <input 
                   type="text" 
                   className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                   placeholder="Search Customer Name or Device IP to auto-fill..."
                   value={searchTerm}
                   onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                />
                {/* Dropdown Results */}
                {showResults && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                        {filteredCustomers.length > 0 && (
                            <div className="p-2">
                                <div className="text-xs font-bold text-slate-400 px-2 py-1">Customers</div>
                                {filteredCustomers.map(c => (
                                    <div key={c.id} onClick={() => handleSelectCustomer(c)} className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer rounded-lg">
                                        <div className="bg-green-100 text-green-600 p-1.5 rounded"><User size={14} /></div>
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-700">{c.name}</p>
                                            <p className="text-xs text-slate-500">{c.address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {filteredDevices.length > 0 && (
                            <div className="p-2 border-t border-slate-100">
                                <div className="text-xs font-bold text-slate-400 px-2 py-1">Devices</div>
                                {filteredDevices.map(d => (
                                    <div key={d.id} onClick={() => handleSelectDevice(d)} className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer rounded-lg">
                                        <div className="bg-purple-100 text-purple-600 p-1.5 rounded"><Server size={14} /></div>
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-700">{d.name}</p>
                                            <p className="text-xs text-slate-500">{d.ip_address} • {d.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
          )}

          {preSelectedCustomer && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-3">
                  <User className="text-green-600" size={20} />
                  <div>
                      <p className="text-xs text-green-700 font-bold">Creating ticket for:</p>
                      <p className="text-sm font-medium text-slate-800">{preSelectedCustomer.name} <span className="text-slate-500 text-xs">({preSelectedCustomer.id})</span></p>
                  </div>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Title</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Fiber Cut at Sector 4"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as TicketType})}
              >
                {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.severity}
                onChange={e => setFormData({...formData, severity: e.target.value as Severity})}
              >
                {Object.values(Severity).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* DYNAMIC RELATIONSHIP FIELDS */}
          {showInvoiceSelect && relatedInvoices.length > 0 && (
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                 <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <FileText size={12} /> Related Invoice
                 </label>
                 <select 
                    className="w-full text-sm p-2 border rounded"
                    value={formData.related_invoice_id}
                    onChange={e => setFormData({...formData, related_invoice_id: e.target.value})}
                 >
                    <option value="">-- No Specific Invoice --</option>
                    {relatedInvoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                            {inv.id} ({inv.status} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(inv.amount)})
                        </option>
                    ))}
                 </select>
             </div>
          )}

          {showMaintenanceSelect && activeMaintenance.length > 0 && (
             <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                 <label className="block text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                    <Wrench size={12} /> Link to Active Maintenance
                 </label>
                 <select 
                    className="w-full text-sm p-2 border border-yellow-300 rounded bg-white text-slate-700"
                    value={formData.related_maintenance_id}
                    onChange={e => setFormData({...formData, related_maintenance_id: e.target.value})}
                 >
                    <option value="">-- Not Related to Maintenance --</option>
                    {activeMaintenance.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.title} ({m.status})
                        </option>
                    ))}
                 </select>
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. POP Jakarta"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Impact (Users)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.impact_users}
                  onChange={e => setFormData({...formData, impact_users: parseInt(e.target.value)})}
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">SLA Deadline</label>
             <input 
               required
               type="datetime-local" 
               className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
               value={formData.sla_deadline}
               onChange={e => setFormData({...formData, sla_deadline: e.target.value})}
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Describe the issue details..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          {/* Linked IDs (Hidden/Advanced) */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Linked Device ID</label>
                <input type="text" className="w-full px-3 py-1.5 border rounded text-xs" value={formData.device_id} onChange={e => setFormData({...formData, device_id: e.target.value})} placeholder="Optional" />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Linked Customer ID</label>
                <input type="text" className="w-full px-3 py-1.5 border rounded text-xs" value={formData.link_id} onChange={e => setFormData({...formData, link_id: e.target.value})} placeholder="Optional" />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <Save size={18} /> Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;