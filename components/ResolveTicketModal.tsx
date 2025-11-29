
import React, { useState } from 'react';
import { Ticket, TicketStatus, ActivityLogEntry } from '../types';
import { X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface ResolveTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (data: { rootCause: string; actionTaken: string; resolutionCode: string; notes: string }) => void;
  ticket: Ticket;
}

const ROOT_CAUSES = [
  'Fiber Cut / Cable Break',
  'Power Outage (PLN)',
  'Hardware Failure (Router/Switch)',
  'Software Bug / Firmware',
  'Configuration Error',
  'Capacity / Congestion',
  'DDoS Attack',
  'Client Side Issue (CPE/LAN)'
];

const RESOLUTION_CODES = [
  'R01 - Replaced Hardware',
  'R02 - Spliced Fiber',
  'R03 - Rebooted Device',
  'R04 - Software Patch / Rollback',
  'R05 - Power Restored',
  'R06 - Educated Customer',
  'R07 - False Alarm'
];

const ResolveTicketModal: React.FC<ResolveTicketModalProps> = ({ isOpen, onClose, onResolve, ticket }) => {
  const [formData, setFormData] = useState({
    rootCause: '',
    actionTaken: '',
    resolutionCode: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-green-50">
          <div>
            <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
              <CheckCircle size={24} /> Resolve Ticket
            </h3>
            <p className="text-xs text-green-700 mt-1">
              Finalizing Ticket <span className="font-mono font-bold">{ticket.id}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
             <FileText className="text-blue-500 flex-shrink-0" size={20} />
             <div className="text-sm text-blue-800">
                <p className="font-bold">Incident Summary:</p>
                <p className="line-clamp-2 opacity-80">{ticket.title}</p>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Root Cause Category</label>
            <select 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={formData.rootCause}
              onChange={e => setFormData({...formData, rootCause: e.target.value})}
            >
              <option value="">-- Select Root Cause --</option>
              {ROOT_CAUSES.map(rc => <option key={rc} value={rc}>{rc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Action Taken</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none placeholder:text-slate-400"
              placeholder="Describe the technical steps taken to fix the issue..."
              value={formData.actionTaken}
              onChange={e => setFormData({...formData, actionTaken: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Code</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={formData.resolutionCode}
                  onChange={e => setFormData({...formData, resolutionCode: e.target.value})}
                >
                  <option value="">-- Select Code --</option>
                  {RESOLUTION_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes / Recommendations</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Any follow-up needed? (Optional)"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
              <CheckCircle size={18} /> Confirm Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveTicketModal;
