
import React, { useState, useEffect, useRef } from 'react';
import { SyslogMessage, SyslogLevel } from '../types';
import { Search, Play, Pause, Filter, Trash2, Terminal, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface SyslogViewerProps {
  initialLogs: SyslogMessage[];
}

const SyslogViewer: React.FC<SyslogViewerProps> = ({ initialLogs }) => {
  const [logs, setLogs] = useState<SyslogMessage[]>(initialLogs);
  const [isPaused, setIsPaused] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [levelFilter, setLevelFilter] = useState<SyslogLevel | 'ALL'>('ALL');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simulate Live Incoming Logs
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // 30% chance to generate a log every 3 seconds
      if (Math.random() > 0.7) {
        const levels = Object.values(SyslogLevel);
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        const hostnames = ['CCR1036-01', 'OLT-ZTE-C320', 'SW-DIST-BKS', 'DEV-ROB-001'];
        const apps = ['kernel', 'sshd', 'bgp', 'interface', 'system', 'dhcp'];
        
        const newLog: SyslogMessage = {
            id: `sys-live-${Date.now()}`,
            timestamp: new Date().toISOString(),
            hostname: hostnames[Math.floor(Math.random() * hostnames.length)],
            ip_address: '192.168.88.' + Math.floor(Math.random() * 255),
            level: randomLevel,
            app_name: apps[Math.floor(Math.random() * apps.length)],
            message: `Simulated event: process state change to ${Math.floor(Math.random() * 100)}`
        };

        setLogs(prev => [...prev, newLog].slice(-500)); // Keep last 500
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto scroll to bottom if not paused
  useEffect(() => {
    if (!isPaused && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const filteredLogs = logs.filter(log => {
      const textMatch = 
        log.message.toLowerCase().includes(filterText.toLowerCase()) ||
        log.hostname.toLowerCase().includes(filterText.toLowerCase()) ||
        log.app_name?.toLowerCase().includes(filterText.toLowerCase());
      
      const levelMatch = levelFilter === 'ALL' || log.level === levelFilter;

      return textMatch && levelMatch;
  });

  const getLevelColor = (level: SyslogLevel) => {
      switch (level) {
          case SyslogLevel.EMERGENCY:
          case SyslogLevel.ALERT:
          case SyslogLevel.CRITICAL: return 'text-red-500 font-bold';
          case SyslogLevel.ERROR: return 'text-red-400 font-bold';
          case SyslogLevel.WARNING: return 'text-orange-400';
          case SyslogLevel.NOTICE: return 'text-blue-400';
          case SyslogLevel.INFO: return 'text-green-400';
          case SyslogLevel.DEBUG: return 'text-slate-500';
          default: return 'text-slate-300';
      }
  };

  const getLevelIcon = (level: SyslogLevel) => {
      switch (level) {
          case SyslogLevel.EMERGENCY:
          case SyslogLevel.ALERT:
          case SyslogLevel.CRITICAL: return <ShieldAlert size={14} />;
          case SyslogLevel.ERROR: return <AlertTriangle size={14} />;
          case SyslogLevel.WARNING: return <AlertCircle size={14} />;
          default: return <Info size={14} />;
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg text-green-400">
                  <Terminal size={20} />
              </div>
              <div>
                  <h2 className="text-lg font-bold text-slate-800">Centralized Syslog</h2>
                  <p className="text-xs text-slate-500">Live stream from {logs.length} events</p>
              </div>
          </div>

          <div className="flex flex-1 w-full md:w-auto items-center gap-3">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
              </div>
              <select 
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
              >
                  <option value="ALL">All Levels</option>
                  {Object.values(SyslogLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
          </div>

          <div className="flex gap-2">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                    isPaused ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}
              >
                  {isPaused ? <><Pause size={16} /> Paused</> : <><Play size={16} /> Live</>}
              </button>
              <button 
                onClick={() => setLogs([])}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Clear Buffer"
              >
                  <Trash2 size={18} />
              </button>
          </div>
      </div>

      {/* Log Console */}
      <div className="flex-1 bg-slate-900 rounded-xl shadow-inner border border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-500">/var/log/messages (Cluster Aggregated)</span>
              <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
              {filteredLogs.length === 0 ? (
                  <div className="text-slate-600 italic text-center mt-10">Waiting for logs...</div>
              ) : (
                  filteredLogs.map(log => (
                      <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded transition-colors group">
                          <span className="text-slate-500 min-w-[140px] select-none">
                              {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-blue-400 min-w-[100px] font-bold">
                              {log.hostname}
                          </span>
                          <span className={`min-w-[80px] flex items-center gap-1.5 ${getLevelColor(log.level)}`}>
                              {getLevelIcon(log.level)} {log.level.toUpperCase()}
                          </span>
                          <span className="text-indigo-300 min-w-[80px]">
                              {log.app_name}:
                          </span>
                          <span className="text-slate-300 break-all flex-1">
                              {log.message}
                          </span>
                      </div>
                  ))
              )}
              <div ref={bottomRef} />
          </div>
      </div>

    </div>
  );
};

export default SyslogViewer;
