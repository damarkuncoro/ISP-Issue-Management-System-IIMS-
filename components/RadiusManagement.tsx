
import React, { useState, useEffect } from 'react';
import { RadiusSession, RadiusLog, UserRole, Customer } from '../types';
import { Search, Shield, RefreshCw, XCircle, CheckCircle, AlertOctagon, Wifi, Clock, Activity, Lock, Filter, User } from 'lucide-react';

interface RadiusManagementProps {
  sessions: RadiusSession[];
  logs: RadiusLog[];
  customers: Customer[];
  userRole: UserRole;
  onKickSession: (sessionId: string) => void;
  onNavigateToCustomer: (customerId: string) => void;
}

const RadiusManagement: React.FC<RadiusManagementProps> = ({ 
    sessions, 
    logs, 
    customers,
    userRole, 
    onKickSession,
    onNavigateToCustomer
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'logs'>('sessions');
  const [filterText, setFilterText] = useState('');
  const [localSessions, setLocalSessions] = useState<RadiusSession[]>(sessions);

  // Simulate Live Traffic Updates
  useEffect(() => {
    setLocalSessions(sessions); // Sync with props initially
    
    const interval = setInterval(() => {
        setLocalSessions(prev => prev.map(s => ({
            ...s,
            current_download_rate: Math.max(0, s.current_download_rate + (Math.random() - 0.5) * 5),
            current_upload_rate: Math.max(0, s.current_upload_rate + (Math.random() - 0.5) * 1),
            download_total_mb: s.download_total_mb + (s.current_download_rate / 8), // rough approx add MB
            uptime_seconds: s.uptime_seconds + 2
        })));
    }, 2000);

    return () => clearInterval(interval);
  }, [sessions]);

  // Access Control
  const canManage = userRole === UserRole.NOC || userRole === UserRole.NETWORK || userRole === UserRole.MANAGER;

  const filteredSessions = localSessions.filter(s => 
    s.username.toLowerCase().includes(filterText.toLowerCase()) ||
    s.ip_address.includes(filterText) ||
    s.mac_address.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.username.toLowerCase().includes(filterText.toLowerCase()) ||
    l.message.toLowerCase().includes(filterText.toLowerCase()) ||
    l.nas_ip.includes(filterText)
  );

  const formatUptime = (seconds: number) => {
      const d = Math.floor(seconds / (3600*24));
      const h = Math.floor(seconds % (3600*24) / 3600);
      const m = Math.floor(seconds % 3600 / 60);
      return `${d}d ${h}h ${m}m`;
  };

  const formatBytes = (mb: number) => {
      if (mb > 1024) return `${(mb/1024).toFixed(2)} GB`;
      return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-indigo-600" /> AAA & Radius Manager
            </h2>
            <p className="text-slate-500">Manage active PPPoE sessions, Hotspot users, and Authentication logs.</p>
         </div>
         <div className="flex gap-2">
             <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex flex-col items-center">
                 <span className="text-xs font-bold text-green-600 uppercase">Online Users</span>
                 <span className="text-xl font-bold text-slate-800">{localSessions.length}</span>
             </div>
             <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex flex-col items-center">
                 <span className="text-xs font-bold text-blue-600 uppercase">Total Throughput</span>
                 <span className="text-xl font-bold text-slate-800">
                     {Math.round(localSessions.reduce((a,b) => a + b.current_download_rate, 0))} Mbps
                 </span>
             </div>
         </div>
      </div>

      {/* TABS & FILTERS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-2">
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('sessions')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                        activeTab === 'sessions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                      <Wifi size={16} /> Active Sessions
                  </button>
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                        activeTab === 'logs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                      <Filter size={16} /> Auth Logs
                  </button>
              </div>
              <div className="p-2 w-full sm:max-w-xs relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Filter by Username, IP, MAC..." 
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
              </div>
          </div>

          {/* ACTIVE SESSIONS TAB */}
          {activeTab === 'sessions' && (
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                          <tr>
                              <th className="px-6 py-3">User Identity</th>
                              <th className="px-6 py-3">Network Info</th>
                              <th className="px-6 py-3">Uptime & Status</th>
                              <th className="px-6 py-3 text-right">Traffic (Live)</th>
                              <th className="px-6 py-3 text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredSessions.map(session => (
                              <tr key={session.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-indigo-700 flex items-center gap-2">
                                          <User size={14} className="text-slate-400" />
                                          {session.username}
                                      </div>
                                      <div className="text-xs text-slate-500 font-mono mt-1">MAC: {session.mac_address}</div>
                                      {session.customer_id && (
                                          <button 
                                            onClick={() => onNavigateToCustomer(session.customer_id!)}
                                            className="text-[10px] text-blue-500 hover:underline mt-1 block"
                                          >
                                              View {session.customer_id}
                                          </button>
                                      )}
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-2 text-slate-700 font-mono text-xs">
                                          <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{session.ip_address}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-1">NAS: {session.nas_ip}</div>
                                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded mt-1 inline-block border border-purple-100">{session.protocol}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-2 mb-1">
                                          <Clock size={14} className="text-green-500" />
                                          <span className="text-slate-700 font-medium">{formatUptime(session.uptime_seconds)}</span>
                                      </div>
                                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="flex flex-col items-end gap-1">
                                          <div className="text-xs font-mono text-green-600 flex items-center gap-1">
                                              {session.current_download_rate.toFixed(1)} M <Activity size={12}/>
                                          </div>
                                          <div className="text-xs font-mono text-blue-600">
                                              {session.current_upload_rate.toFixed(1)} M Up
                                          </div>
                                          <div className="text-[10px] text-slate-400 mt-1">
                                              Total: {formatBytes(session.download_total_mb)}
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      {canManage ? (
                                          <button 
                                            onClick={() => onKickSession(session.id)}
                                            className="text-red-500 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-3 py-1.5 rounded transition text-xs font-bold flex items-center justify-center gap-1 mx-auto"
                                            title="Disconnect Session (CoA)"
                                          >
                                              <XCircle size={14} /> Kick
                                          </button>
                                      ) : (
                                          <span className="text-slate-300"><Lock size={14} /></span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                          {filteredSessions.length === 0 && (
                              <tr><td colSpan={5} className="text-center py-8 text-slate-500">No active sessions matching criteria.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                          <tr>
                              <th className="px-6 py-3">Timestamp</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Username</th>
                              <th className="px-6 py-3">Message</th>
                              <th className="px-6 py-3">NAS / Gateway</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                      {new Date(log.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${
                                          log.reply === 'Accept' ? 'bg-green-100 text-green-700' : 
                                          log.reply === 'Reject' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                          {log.reply === 'Accept' ? <CheckCircle size={12} /> : log.reply === 'Reject' ? <XCircle size={12} /> : <AlertOctagon size={12} />}
                                          {log.reply}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-800">
                                      {log.username}
                                      <div className="text-[10px] text-slate-400 font-mono">{log.mac_address || '-'}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-600">
                                      {log.message}
                                  </td>
                                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                      {log.nas_ip}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default RadiusManagement;
