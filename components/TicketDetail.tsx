
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Severity, Employee, ActivityLogEntry } from '../types';
import { STATUS_COLORS } from '../constants';
import { AIAnalysisResult, analyzeTicketWithGemini } from '../services/geminiService';
import { 
  ArrowLeft, MapPin, Server, Users, Clock, AlertTriangle, 
  CheckCircle, Play, UserPlus, PenTool, Sparkles, MessageSquare,
  History, FileText, BrainCircuit, Activity, Link as LinkIcon
} from 'lucide-react';
import AssignTicketModal from './AssignTicketModal';
import ResolveTicketModal from './ResolveTicketModal';

interface TicketDetailProps {
  ticket: Ticket;
  employees: Employee[]; // Passed from App for assignment
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: TicketStatus) => void;
  onUpdateTicket: (id: string, data: Partial<Ticket>) => void;
  onNavigateToDevice?: (deviceId: string) => void;
  onNavigateToCustomer?: (customerId: string) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ 
    ticket, 
    employees, 
    onBack, 
    onUpdateStatus, 
    onUpdateTicket,
    onNavigateToDevice,
    onNavigateToCustomer 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'history'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  
  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Load persisted AI Analysis if available
  useEffect(() => {
    if (ticket.aiAnalysis) {
        try {
            setAiResult(JSON.parse(ticket.aiAnalysis));
        } catch (e) {
            console.error("Failed to parse saved AI analysis", e);
            setAiResult(null);
        }
    } else {
        setAiResult(null);
    }
  }, [ticket.id, ticket.aiAnalysis]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeTicketWithGemini(ticket);
    
    if (result) {
        setAiResult(result);
        
        // Persist the analysis to the ticket
        const timestamp = new Date().toISOString();
        const newLogEntry: ActivityLogEntry = {
            id: `log-ai-${Date.now()}`,
            action: 'AI Analysis',
            description: 'Gemini AI Diagnostic run triggered.',
            timestamp: timestamp,
            user: 'System Assistant'
        };

        const updatedLogs = [newLogEntry, ...(ticket.activityLog || [])];

        onUpdateTicket(ticket.id, { 
            aiAnalysis: JSON.stringify(result),
            activityLog: updatedLogs
        });
    }
    
    setIsAnalyzing(false);
  };

  const handleAssignEmployee = (employee: Employee) => {
      const timestamp = new Date().toISOString();
      const newLogEntry: ActivityLogEntry = {
          id: `log-assign-${Date.now()}`,
          action: 'Ticket Assigned',
          description: `Ticket assigned to ${employee.full_name} (${employee.position})`,
          timestamp: timestamp,
          user: 'NOC Engineer'
      };

      const updatedLogs = [newLogEntry, ...(ticket.activityLog || [])];

      // Update ticket with new assignee and set status to ASSIGNED
      onUpdateTicket(ticket.id, {
          assignee: employee.full_name,
          status: TicketStatus.ASSIGNED,
          activityLog: updatedLogs
      });
  };

  const handleResolveTicket = (data: { rootCause: string; actionTaken: string; resolutionCode: string; notes: string }) => {
      const timestamp = new Date().toISOString();
      
      const newLogEntry: ActivityLogEntry = {
          id: `log-resolve-${Date.now()}`,
          action: 'Ticket Resolved',
          description: `Resolved: ${data.resolutionCode} - ${data.rootCause}. Action: ${data.actionTaken}`,
          timestamp: timestamp,
          user: ticket.assignee || 'Engineer'
      };
      
      const updatedLogs = [newLogEntry, ...(ticket.activityLog || [])];
      
      // Update ticket description or append notes? 
      // Let's create a resolution summary block in description for now, or just rely on log
      const resolutionSummary = `\n\n--- RESOLUTION REPORT ---\nRoot Cause: ${data.rootCause}\nAction: ${data.actionTaken}\nCode: ${data.resolutionCode}\nNotes: ${data.notes}`;

      onUpdateTicket(ticket.id, {
          status: TicketStatus.RESOLVED,
          activityLog: updatedLogs,
          description: ticket.description + resolutionSummary
      });
  };

  const getNextActions = () => {
    switch (ticket.status) {
      case TicketStatus.OPEN:
        return (
          <button 
            onClick={() => onUpdateStatus(ticket.id, TicketStatus.INVESTIGATING)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Play size={16} /> Start Investigation
          </button>
        );
      case TicketStatus.INVESTIGATING:
        return (
          <div className="flex gap-2">
            <button 
               onClick={() => setIsAssignModalOpen(true)}
               className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <UserPlus size={16} /> Assign Engineer
            </button>
            <button 
               onClick={() => setIsResolveModalOpen(true)}
               className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <CheckCircle size={16} /> Quick Resolve
            </button>
          </div>
        );
      case TicketStatus.ASSIGNED:
        return (
          <button 
            onClick={() => onUpdateStatus(ticket.id, TicketStatus.FIXING)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm"
          >
            <PenTool size={16} /> Start Fixing
          </button>
        );
      case TicketStatus.FIXING:
        return (
          <button 
            onClick={() => setIsResolveModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            <CheckCircle size={16} /> Mark Resolved
          </button>
        );
      case TicketStatus.RESOLVED:
        return (
          <button 
            onClick={() => onUpdateStatus(ticket.id, TicketStatus.CLOSED)}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition shadow-sm"
          >
            <CheckCircle size={16} /> Close Ticket
          </button>
        );
      default:
        return <span className="text-slate-500 italic">No actions available</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      {/* Modals */}
      <AssignTicketModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignEmployee}
        employees={employees}
        currentTicket={ticket}
      />

      <ResolveTicketModal 
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onResolve={handleResolveTicket}
        ticket={ticket}
      />

      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">{ticket.id}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[ticket.status]}`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-slate-500">{ticket.title}</p>
        </div>
        <div className="flex items-center gap-2">
            {getNextActions()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) - TABS & CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <FileText size={16} /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Sparkles size={16} /> AI Diagnostics
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <History size={16} /> History
            </button>
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" /> Description & Logs
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{ticket.description}</p>
                </div>
                {ticket.logs && (
                  <div>
                     <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">System Logs</h4>
                     <pre className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                       {ticket.logs}
                     </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI DIAGNOSTICS */}
          {activeTab === 'ai' && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                        <BrainCircuit size={20} className="text-indigo-600" /> Gemini NOC Assistant
                    </h3>
                    <p className="text-sm text-indigo-600/80">Automated root cause analysis and resolution suggestions.</p>
                </div>
                
                <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing || ticket.status === TicketStatus.CLOSED}
                  className="px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                    </>
                  ) : (
                    <>
                        <Sparkles size={18} /> Run Analysis
                    </>
                  )}
                </button>
              </div>
              
              {aiResult ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {/* Root Cause Card */}
                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                      <h4 className="font-bold text-indigo-900 text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                          <Activity size={16} /> Potential Root Cause
                      </h4>
                      <p className="text-slate-700 leading-relaxed">{aiResult.rootCause}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Action Card */}
                      <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                          <h4 className="font-bold text-green-800 text-sm mb-2 uppercase tracking-wide">Recommended Action</h4>
                          <p className="text-slate-700 text-sm">{aiResult.recommendedAction}</p>
                      </div>
                      
                      {/* Estimation Card */}
                      <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                          <h4 className="font-bold text-orange-800 text-sm mb-2 uppercase tracking-wide">Estimated Fix Time</h4>
                          <p className="text-slate-800 font-mono text-lg">{aiResult.estimatedFixTime}</p>
                      </div>
                    </div>

                    {/* Priority Assessment */}
                    <div className="bg-indigo-900 text-white p-5 rounded-xl shadow-md">
                        <h4 className="font-bold text-indigo-200 text-sm mb-2 uppercase tracking-wide">Priority Assessment</h4>
                        <p className="text-indigo-50 text-sm italic">"{aiResult.priorityAssessment}"</p>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-indigo-200 rounded-xl">
                    <Sparkles size={48} className="text-indigo-200 mx-auto mb-4" />
                    <p className="text-indigo-400 font-medium">No analysis data yet.</p>
                    <p className="text-sm text-indigo-300">Click "Run Analysis" to let AI investigate logs and metadata.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: HISTORY */}
          {activeTab === 'history' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <History size={18} className="text-slate-500" /> Audit Trail & Activity Log
                </h3>
                <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-[19px] before:bg-slate-200 before:w-0.5 before:z-0">
                  {ticket.activityLog && ticket.activityLog.length > 0 ? (
                    ticket.activityLog.map((event) => (
                      <div key={event.id} className="relative pl-10 z-10">
                          <div className="absolute left-3 top-1 w-4 h-4 bg-white border-4 border-blue-500 rounded-full"></div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">{event.action}</h4>
                                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{event.description}</p>
                             </div>
                             <div className="text-right mt-2 sm:mt-0 flex-shrink-0">
                                <p className="text-xs font-mono text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                                <p className="text-xs uppercase font-bold text-blue-600 mt-1">{event.user}</p>
                             </div>
                          </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic pl-10">No activity logged.</p>
                  )}
                </div>
             </div>
          )}

        </div>

        {/* RIGHT COLUMN (1/3) - STATIC METADATA */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Ticket Metadata</h3>
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">Location</span>
                    <span className="font-medium text-slate-800">{ticket.location}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Server className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">Device / Link ID</span>
                    <span className="font-medium text-slate-800 break-all">
                       {ticket.device_id ? (
                           <button onClick={() => onNavigateToDevice && onNavigateToDevice(ticket.device_id!)} className="text-blue-600 hover:underline flex items-center gap-1">
                               {ticket.device_id} <LinkIcon size={10} />
                           </button>
                       ) : ticket.link_id ? (
                           <span className="text-slate-800">{ticket.link_id}</span>
                       ) : (
                           'N/A'
                       )}
                    </span>
                  </div>
                </li>
                {ticket.type === 'Customer' && (
                  <li className="flex items-start gap-3">
                     <Users className="text-slate-400 mt-0.5" size={18} />
                     <div>
                        <span className="block text-xs text-slate-500">Customer ID</span>
                        <span className="font-medium text-slate-800 break-all">
                            {ticket.link_id && ticket.link_id.startsWith('CID') ? (
                                <button onClick={() => onNavigateToCustomer && onNavigateToCustomer(ticket.link_id!)} className="text-blue-600 hover:underline flex items-center gap-1">
                                    {ticket.link_id} <LinkIcon size={10} />
                                </button>
                            ) : 'N/A'}
                        </span>
                     </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <Users className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">Impact</span>
                    <span className="font-medium text-slate-800">{ticket.impact_users} Subscribers</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">SLA Deadline</span>
                    <span className="font-medium text-red-600">{new Date(ticket.sla_deadline).toLocaleString()}</span>
                  </div>
                </li>
                 <li className="flex items-start gap-3">
                  <AlertTriangle className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">Severity</span>
                    <span className={`font-medium ${ticket.severity === Severity.CRITICAL ? 'text-red-600' : 'text-slate-800'}`}>{ticket.severity}</span>
                  </div>
                </li>
             </ul>
           </div>
           
           {/* Assignee Section */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Current Assignee</h3>
                    {ticket.status === TicketStatus.INVESTIGATING && (
                        <button 
                            onClick={() => setIsAssignModalOpen(true)}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Assign
                        </button>
                    )}
               </div>
               
               {ticket.assignee ? (
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                       {ticket.assignee.charAt(0)}
                     </div>
                     <div>
                       <p className="font-medium text-slate-800">{ticket.assignee}</p>
                       <p className="text-xs text-slate-500">Technician</p>
                     </div>
                   </div>
               ) : (
                   <div className="flex items-center gap-2 text-slate-500 italic text-sm p-2 bg-slate-50 rounded border border-dashed border-slate-300">
                       <UserPlus size={16} /> Unassigned
                   </div>
               )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
