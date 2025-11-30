
import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus, UserRole, Customer } from '../types';
import { Search, DollarSign, AlertCircle, CheckCircle, Clock, FileText, Download, Plus } from 'lucide-react';
import GenerateInvoiceModal from './GenerateInvoiceModal';

interface BillingListProps {
  invoices: Invoice[];
  customers: Customer[];
  userRole: UserRole;
  onUpdateStatus?: (id: string, status: InvoiceStatus) => void;
  onCreateInvoice?: (data: any) => void;
  preSetFilter?: string;
}

const BillingList: React.FC<BillingListProps> = ({ invoices, customers, userRole, onUpdateStatus, onCreateInvoice, preSetFilter }) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  useEffect(() => {
    if (preSetFilter) {
        setFilterText(preSetFilter);
    }
  }, [preSetFilter]);

  const filteredInvoices = invoices.filter(inv => {
    const cust = customers.find(c => c.id === inv.customer_id);
    const nameMatch = cust?.name.toLowerCase().includes(filterText.toLowerCase()) || false;
    const idMatch = inv.id.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesText = nameMatch || idMatch;
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesText && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold w-fit"><CheckCircle size={12}/> Paid</span>;
      case InvoiceStatus.UNPAID: return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold w-fit"><Clock size={12}/> Unpaid</span>;
      case InvoiceStatus.OVERDUE: return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold w-fit"><AlertCircle size={12}/> Overdue</span>;
      case InvoiceStatus.CANCELLED: return <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold w-fit">Cancelled</span>;
      default: return null;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(val);
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Unknown Customer';
  };

  // Stats
  const totalOverdue = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).reduce((sum, i) => sum + i.amount, 0);
  const totalUnpaid = invoices.filter(i => i.status === InvoiceStatus.UNPAID).reduce((sum, i) => sum + i.amount, 0);

  const canManageBilling = userRole === UserRole.FINANCE || userRole === UserRole.MANAGER;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       
       {isGenerateModalOpen && onCreateInvoice && (
           <GenerateInvoiceModal 
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSubmit={onCreateInvoice}
                customers={customers}
           />
       )}

       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Billing & Invoicing</h2>
            <p className="text-slate-500">Manage customer payments, overdue accounts, and revenue.</p>
         </div>
         <div className="flex gap-4">
             {canManageBilling && (
                 <button 
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-bold"
                 >
                    <Plus size={20} /> Create Invoice
                 </button>
             )}
             <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                <p className="text-xs text-red-500 font-bold uppercase">Overdue Amount</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(totalOverdue)}</p>
             </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-500 font-bold uppercase">Pending Income</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(totalUnpaid)}</p>
             </div>
         </div>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Invoice ID or Customer Name..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
             <div className="relative min-w-[150px]">
                <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 appearance-none bg-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    {Object.values(InvoiceStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
                <tr>
                   <th className="px-6 py-4">Invoice Details</th>
                   <th className="px-6 py-4">Customer</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4">Due Date</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{inv.id}</div>
                            <div className="text-xs text-slate-500">{new Date(inv.issue_date).toLocaleDateString()}</div>
                        </td>
                         <td className="px-6 py-4">
                            <div className="font-medium text-slate-700">{getCustomerName(inv.customer_id)}</div>
                            <div className="text-xs text-slate-500 font-mono">{inv.customer_id}</div>
                        </td>
                         <td className="px-6 py-4 font-bold text-slate-800">
                            {formatCurrency(inv.amount)}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`${inv.status === InvoiceStatus.OVERDUE ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                                {new Date(inv.due_date).toLocaleDateString()}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                             {getStatusBadge(inv.status)}
                        </td>
                        <td className="px-6 py-4">
                             <div className="flex gap-2">
                                <button className="text-slate-500 hover:text-blue-600 p-1.5 rounded transition bg-slate-100" title="View PDF">
                                    <FileText size={16} />
                                </button>
                                {canManageBilling && inv.status !== InvoiceStatus.PAID && onUpdateStatus && (
                                     <button 
                                        onClick={() => onUpdateStatus(inv.id, InvoiceStatus.PAID)}
                                        className="text-green-600 hover:text-green-800 p-1.5 rounded transition bg-green-50 border border-green-200 text-xs font-bold"
                                        title="Mark as Paid"
                                    >
                                        Mark Paid
                                    </button>
                                )}
                             </div>
                        </td>
                    </tr>
                 ))}
                 {filteredInvoices.length === 0 && (
                     <tr><td colSpan={6} className="text-center py-8 text-slate-500">No invoices found.</td></tr>
                 )}
              </tbody>
            </table>
         </div>
       </div>
    </div>
  );
};

export default BillingList;
