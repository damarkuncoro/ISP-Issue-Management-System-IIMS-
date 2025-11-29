
import React, { useState, useEffect, useRef } from 'react';
import { Search, Ticket as TicketIcon, User, Server, ChevronRight } from 'lucide-react';
import { Ticket, Customer, Device } from '../types';

interface GlobalSearchProps {
  tickets: Ticket[];
  customers: Customer[];
  devices: Device[];
  onNavigateToTicket: (ticket: Ticket) => void;
  onNavigateToCustomer: (customer: Customer) => void;
  onNavigateToDevice: (deviceId: string) => void; // Usually just switches view and filters
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  tickets, 
  customers, 
  devices, 
  onNavigateToTicket, 
  onNavigateToCustomer,
  onNavigateToDevice 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  };

  const handleSelect = (callback: () => void) => {
    callback();
    setIsOpen(false);
    setQuery('');
  };

  // Search Logic
  const filteredTickets = query ? tickets.filter(t => 
    t.id.toLowerCase().includes(query.toLowerCase()) || 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.location.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3) : [];

  const filteredCustomers = query ? customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.id.toLowerCase().includes(query.toLowerCase()) ||
    c.address.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3) : [];

  const filteredDevices = query ? devices.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) || 
    d.ip_address.includes(query) ||
    d.model.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3) : [];

  const hasResults = filteredTickets.length > 0 || filteredCustomers.length > 0 || filteredDevices.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Global Search (Ticket ID, Customer Name, IP...)" 
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-sm"
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
        {query && (
            <button 
                onClick={() => { setQuery(''); setIsOpen(false); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs uppercase font-bold"
            >
                ESC
            </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {!hasResults ? (
            <div className="p-8 text-center text-slate-500">
               <p className="text-sm">No results found for "<span className="font-bold text-slate-700">{query}</span>"</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              
              {/* TICKETS */}
              {filteredTickets.length > 0 && (
                <div className="py-2">
                  <h4 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wide">Tickets</h4>
                  {filteredTickets.map(t => (
                    <div 
                        key={t.id} 
                        onClick={() => handleSelect(() => onNavigateToTicket(t))}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                    >
                        <div className={`p-2 rounded-lg ${t.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <TicketIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <span className="font-mono">{t.id}</span> • {t.status}
                            </p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* CUSTOMERS */}
              {filteredCustomers.length > 0 && (
                <div className="py-2 border-t border-slate-100">
                  <h4 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wide">Customers</h4>
                  {filteredCustomers.map(c => (
                    <div 
                        key={c.id} 
                        onClick={() => handleSelect(() => onNavigateToCustomer(c))}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                    >
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                            <p className="text-xs text-slate-500 truncate">{c.address}</p>
                        </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DEVICES */}
              {filteredDevices.length > 0 && (
                <div className="py-2 border-t border-slate-100">
                  <h4 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wide">Devices</h4>
                  {filteredDevices.map(d => (
                    <div 
                        key={d.id} 
                        onClick={() => handleSelect(() => onNavigateToDevice(d.ip_address || d.name))}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                    >
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Server size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{d.ip_address}</p>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="bg-slate-50 p-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
             Press Enter to view all results
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
