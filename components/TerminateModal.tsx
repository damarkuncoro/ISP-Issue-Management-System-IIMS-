
import React, { useState } from 'react';
import { X, UserX, AlertTriangle, Truck } from 'lucide-react';

interface TerminateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, date: string, autoCreateTicket: boolean) => void;
  customerName: string;
}

const TERMINATION_REASONS = [
  'Moving Out of Coverage',
  'Dissatisfied with Service/Speed',
  'Competitor Offer (Cheaper)',
  'Financial Issues',
  'Temporary Disconnect',
  'No Longer Needed'
];

const TerminateModal: React.FC<TerminateModalProps> = ({ isOpen, onClose, onConfirm, customerName }) => {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoCreateTicket, setAutoCreateTicket] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    onConfirm(reason, date, autoCreateTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <UserX size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-red-900">Terminate Subscription</h3>
                <p className="text-xs text-red-700">Customer: {customerName}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           
           <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex gap-2 text-xs text-yellow-800">
               <AlertTriangle size={16} className="flex-shrink-0" />
               <p>This action will disable the customer's internet access permanently. Ensure all retention efforts have been exhausted.</p>
           </div>

           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Leaving</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                 <option value="">-- Select Reason --</option>
                 {TERMINATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
           </div>

           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Termination Date</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
           </div>

           <div className="pt-2">
               <label className="flex items-start gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                   <input 
                     type="checkbox" 
                     className="mt-1"
                     checked={autoCreateTicket}
                     onChange={e => setAutoCreateTicket(e.target.checked)}
                   />
                   <div>
                       <span className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                           <Truck size={14} /> Auto-Create Retrieval Ticket
                       </span>
                       <span className="text-xs text-slate-500">
                           System will generate an 'Infrastructure' ticket for Field Tech to pick up the ONU/Modem at the customer's location.
                       </span>
                   </div>
               </label>
           </div>

           <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!reason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-sm disabled:opacity-50"
              >
                Confirm Termination
              </button>
           </div>

        </form>
      </div>
    </div>
  );
};

export default TerminateModal;
