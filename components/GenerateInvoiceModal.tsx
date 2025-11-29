
import React, { useState } from 'react';
import { Customer, InvoiceStatus } from '../types';
import { X, Save, Plus, Trash2, FileText, User } from 'lucide-react';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoiceData: any) => void;
  customers: Customer[];
}

const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({ isOpen, onClose, onSubmit, customers }) => {
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ description: '', amount: 0 }]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
        setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: any) => {
    const newItems = [...items];
    if (field === 'amount') {
        newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else {
        newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    const invoiceData = {
        customer_id: customerId,
        amount: calculateTotal(),
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate,
        status: InvoiceStatus.UNPAID,
        items: items
    };
    onSubmit(invoiceData);
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-green-50">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <FileText size={20} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-green-900">Generate Invoice</h3>
                <p className="text-xs text-green-700">Create a new manual bill for customer</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer</label>
             <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <select 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                 >
                    <option value="">-- Search Customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                 </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
             <input 
                required
                type="date"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
             />
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-medium text-slate-700">Invoice Items</label>
                 <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1"
                 >
                    <Plus size={12} /> Add Item
                 </button>
             </div>
             
             <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                 {items.map((item, idx) => (
                     <div key={idx} className="flex gap-2 items-start">
                         <input 
                            type="text" 
                            placeholder="Description (e.g. Installation Fee)" 
                            className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-green-500"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            required
                         />
                         <input 
                            type="number" 
                            placeholder="Amount" 
                            className="w-28 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-green-500"
                            value={item.amount || ''}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            required
                            min="0"
                         />
                         <button 
                            type="button" 
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition"
                            disabled={items.length === 1}
                         >
                             <Trash2 size={16} />
                         </button>
                     </div>
                 ))}
             </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-600">Total Amount</span>
              <span className="text-xl font-bold text-green-700">{formatCurrency(calculateTotal())}</span>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-bold shadow-sm"
            >
              <Save size={18} /> Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
