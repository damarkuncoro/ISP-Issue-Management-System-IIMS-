
import React, { useState } from 'react';
import { Ticket, TicketStatus, Severity, Customer, Device } from '../types';
import { STATUS_COLORS, SEVERITY_COLORS, MOCK_CUSTOMERS, MOCK_DEVICES } from '../constants';
import { Search, Filter, AlertTriangle, Plus } from 'lucide-react';
import CreateTicketModal from './CreateTicketModal';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onCreateTicket: (ticketData: any) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onSelectTicket, onCreateTicket }) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesText = ticket.title.toLowerCase().includes(filterText.toLowerCase()) || 
                        ticket.id.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    return matchesText && matchesStatus;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Create Modal */}
      <CreateTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateTicket}
        customers={MOCK_CUSTOMERS as unknown as Customer[]} // In real app, pass from props
        devices={MOCK_DEVICES as unknown as Device[]} // In real app, pass from props
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search tickets by ID, Title, or Location..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg p-1">
               <Filter className="text-slate-400 ml-2" size={18} />
               <select 
                 className="bg-transparent text-slate-700 text-sm focus:outline-none block p-1.5"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option value="All">All Statuses</option>
                 {Object.values(TicketStatus).map(status => (
                   <option key={status} value={status}>{status}</option>
                 ))}
               </select>
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition shadow-sm"
            >
              <Plus size={20} />
              <span className="hidden sm:inline font-medium">New Ticket</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Subject & Location</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Impact</th>
                <th className="px-6 py-4">SLA Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => onSelectTicket(ticket)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{ticket.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{ticket.location} • {ticket.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 ${SEVERITY_COLORS[ticket.severity]}`}>
                      {ticket.severity === Severity.CRITICAL && <AlertTriangle size={14} />}
                      {ticket.severity}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {ticket.impact_users > 0 ? `${ticket.impact_users} Users` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {new Date(ticket.sla_deadline).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No tickets found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
