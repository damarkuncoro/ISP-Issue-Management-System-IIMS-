
import React from 'react';
import { Ticket, TicketStatus, Severity, TicketType } from '../../types';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import TopologyMap from '../TopologyMap';

interface FieldDashboardProps {
  tickets: Ticket[];
  onNavigateToTicket: (ticket: Ticket) => void;
}

const StatCard = ({ title, value, subtext, icon, colorClass, active }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string, active?: boolean }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border ${active ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'} flex items-start justify-between transition-all hover:shadow-md`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const FieldDashboard: React.FC<FieldDashboardProps> = ({ tickets, onNavigateToTicket }) => {
  const activeTickets = tickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);
  const myTickets = activeTickets.filter(t => t.type === TicketType.INFRASTRUCTURE || t.type === TicketType.CUSTOMER);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Good Afternoon, Field Team.</h3>
          <p className="opacity-90">You have {myTickets.length} active jobs assigned in your queue.</p>
        </div>
        <Truck size={40} className="opacity-80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Pending Jobs" 
          value={myTickets.length} 
          subtext="Within 5km radius"
          icon={<MapPin size={24} />}
          colorClass="text-blue-600"
          active
        />
        <StatCard 
          title="Avg Resolution Time" 
          value="2h 15m" 
          subtext="-15m from last week"
          icon={<Clock size={24} />}
          colorClass="text-green-600"
        />
        <StatCard 
          title="SLA Breaches" 
          value="0" 
          subtext="Great job!"
          icon={<CheckCircle size={24} />}
          colorClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-slate-700 mb-4">Task Location Map</h4>
          <TopologyMap tickets={myTickets} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-700 mb-4">My Task Queue</h4>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {myTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No active tasks.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myTickets.map(t => (
                  <div key={t.id} className="p-4 hover:bg-slate-50 border-l-4 border-l-blue-500 cursor-pointer" onClick={() => onNavigateToTicket(t)}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-800 text-sm">{t.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.severity === Severity.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{t.severity}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {t.location}</p>
                    <div className="mt-3">
                      <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded hover:bg-slate-900">Start Travel</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDashboard;
