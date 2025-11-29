
import React, { useState } from 'react';
import { Employee, UserRole, EmployeeStatus, Ticket } from '../types';
import { X, UserCheck, MapPin, Briefcase, Calendar, CheckCircle } from 'lucide-react';

interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (employee: Employee) => void;
  employees: Employee[];
  currentTicket: Ticket;
}

const AssignTicketModal: React.FC<AssignTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onAssign, 
  employees,
  currentTicket 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter Logic:
  // 1. Must be FIELD Technician or NETWORK Engineer
  // 2. Must be ACTIVE status
  const eligibleEmployees = employees.filter(e => 
    (e.role === UserRole.FIELD || e.role === UserRole.NETWORK) &&
    e.status === EmployeeStatus.ACTIVE &&
    (e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || e.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConfirm = () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    if (emp) {
        onAssign(emp);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
             <h3 className="text-xl font-bold text-slate-800">Dispatch Technician</h3>
             <p className="text-xs text-slate-500 mt-1">
                Assigning for Ticket: <span className="font-mono font-medium text-slate-700">{currentTicket.id}</span>
             </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        {/* Search & List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
            
            <input 
                type="text" 
                placeholder="Search technician by name or position..." 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
            />

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Available Field Team</h4>
                
                {eligibleEmployees.length > 0 ? (
                    eligibleEmployees.map(emp => (
                        <div 
                            key={emp.id}
                            onClick={() => setSelectedEmpId(emp.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                selectedEmpId === emp.id 
                                ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' 
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    selectedEmpId === emp.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {emp.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h5 className={`font-bold ${selectedEmpId === emp.id ? 'text-blue-800' : 'text-slate-800'}`}>
                                        {emp.full_name}
                                    </h5>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <Briefcase size={12} /> {emp.position}
                                        <span className="text-slate-300">|</span>
                                        <MapPin size={12} /> Area: Jakarta
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                {selectedEmpId === emp.id ? (
                                    <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                        <CheckCircle size={16} /> Selected
                                    </div>
                                ) : (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                        Available
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                        <UserCheck size={32} className="mx-auto text-slate-300 mb-2" />
                        <p>No active field technicians found matching "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!selectedEmpId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              Assign & Notify
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal;
