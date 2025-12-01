
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Severity, Employee, ActivityLogEntry, Device, TicketType, KBArticle } from '../types';
import { STATUS_COLORS } from '../constants';
import { AIAnalysisResult, analyzeTicketWithGemini } from '../services/geminiService';
import { 
  ArrowLeft, MapPin, Server, Users, Clock, AlertTriangle, 
  CheckCircle, Play, UserPlus, PenTool, Sparkles, MessageSquare,
  History, FileText, BrainCircuit, Activity, Link as LinkIcon, Send, Wrench, XCircle, ArrowLeftRight, Printer, BookOpen, Lightbulb, Search, ExternalLink
} from 'lucide-react';
import AssignTicketModal from './AssignTicketModal';
import ResolveTicketModal from './ResolveTicketModal';

interface TicketDetailProps {
  ticket: Ticket;
  employees: Employee[]; 
  devices?: Device[]; 
  tickets?: Ticket[]; 
  kbArticles?: KBArticle[]; 
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: TicketStatus) => void;
  onUpdateTicket: (id: string, data: Partial<Ticket>) => void;
  onNavigateToDevice?: (deviceId: string) => void;
  onNavigateToCustomer?: (customerId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
  onNavigateToMaintenance?: (maintenanceId: string) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ 
    ticket, 
    employees, 
    devices = [],
    tickets = [],
    kbArticles = [],
    onBack, 
    onUpdateStatus, 
    onUpdateTicket,
    onNavigateToDevice,
    onNavigateToCustomer,
    onNavigateToInvoice,
    onNavigateToMaintenance
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'history'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  
  // Note State
  const [noteText, setNoteText] = useState('');
  
  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Suggested Logic
  const suggestedKB = kbArticles.filter(kb => 
    ticket.title.toLowerCase().includes(kb.tags[0]?.toLowerCase() || 'xxxxx') ||
    ticket.title.toLowerCase().includes(kb.category.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(kb.tags[0]?.toLowerCase() || 'xxxxx')
  ).slice(0, 3);

  const similarTickets = tickets.filter(t => 
    t.id !== ticket.id && 
    t.status === TicketStatus.RESOLVED && 
    (t.type === ticket.type || t.device_id === ticket.device_id)
  ).slice(0, 2);

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

  // Helper to trigger visual feedback
  const triggerFeedback = (message: string) => {
      setStatusFeedback(message);
      setTimeout(() => {
          setStatusFeedback(null);
      }, 3000);
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
      onUpdateStatus(ticket.id, newStatus);
      triggerFeedback(`Status updated to ${newStatus}`);
  };

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
        triggerFeedback('AI Analysis Completed');
    }
    
    setIsAnalyzing(false);
  };

  const handleAssignEmployee = (employee: Employee) => {
      const timestamp = new Date().toISOString();
      
      // Create a specific log entry for the assignment
      const newLogEntry: ActivityLogEntry = {
          id: `log-assign-${Date.now()}`,
          action: 'Ticket Assigned',
          description: `Ticket assigned to ${employee.full_name} (${employee.position}).`,
          timestamp: timestamp,
          user: 'NOC Engineer' // In a real app, this would be the logged-in user
      };

      const updatedLogs = [newLogEntry, ...(ticket.activityLog || [])];

      // Update ticket with new assignee, set status to ASSIGNED, and save the log
      onUpdateTicket(ticket.id, {
          assignee: employee.full_name,
          status: TicketStatus.ASSIGNED,
          activityLog: updatedLogs
      });
      triggerFeedback(`Assigned to ${employee.full_name}`);
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
      
      const resolutionSummary = `\n\n--- RESOLUTION REPORT ---\nRoot Cause: ${data.rootCause}\nAction: ${data.actionTaken}\nCode: ${data.resolutionCode}\nNotes: ${data.notes}`;

      onUpdateTicket(ticket.id, {
          status: TicketStatus.RESOLVED,
          activityLog: updatedLogs,
          description: ticket.description + resolutionSummary
      });
      triggerFeedback('Ticket Resolved Successfully');
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const timestamp = new Date().toISOString();
    const newLogEntry: ActivityLogEntry = {
        id: `log-note-${Date.now()}`,
        action: 'Internal Note',
        description: noteText,
        timestamp: timestamp,
        user: ticket.assignee || 'NOC Engineer'
    };

    const updatedLogs = [newLogEntry, ...(ticket.activityLog || [])];

    onUpdateTicket(ticket.id, {
        activityLog: updatedLogs
    });

    setNoteText('');
    setActiveTab('history'); // Switch to history to show the note
    triggerFeedback('Note Added');
  };

  const handlePrint = () => {
      alert("Simulated: Work Order sent to Printer (PDF Generated).");
  };

  const getActionColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('created')) return 'bg-slate-400 border-slate-200 text-slate-500';
    if (lower.includes('resolved') || lower.includes('closed')) return 'bg-green-500 border-green-300 text-green-600';
    if (lower.includes('assigned')) return 'bg-orange-500 border-orange-300 text-orange-600';
    if (lower.includes('ai') || lower.includes('diagnostic')) return 'bg-indigo-500 border-indigo-300 text-indigo-600';
    if (lower.includes('alert') || lower.includes('critical') || lower.includes('escalat')) return 'bg-red-500 border-red-300 text-red-600';
    if (lower.includes('note')) return 'bg-blue-400 border-blue-200 text-blue-500';
    if (lower.includes('status')) return 'bg-cyan-500 border-cyan-300 text-cyan-600';
    return 'bg-blue-500 border-blue-200 text-blue-600';
  };

  // Helper to find device name
  const getDeviceName = (deviceId: string) => {
      const device = devices.find(d => d.id === deviceId);
      return device ? `${device.name} (${device.model})` : deviceId;
  };

  const getNextActions = () => {
    switch (ticket.status) {
      case TicketStatus.OPEN:
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleStatusChange(TicketStatus.INVESTIGATING)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Play size={16} /> Start Investigation
            </button>
            <button 
              onClick={() => handleStatusChange(TicketStatus.CLOSED)}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition shadow-sm border border-slate-200"
            >
              <XCircle size={16} /> False Alarm
            </button>
          </div>
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
          <div className="flex gap-2">
            <button 
                onClick={() => handleStatusChange(TicketStatus.FIXING)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm"
            >
                <PenTool size={16} /> Start Fixing
            </button>
            <button 
                onClick={() => handleStatusChange(TicketStatus.INVESTIGATING)}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
                <ArrowLeftRight size={16} /> Unassign
            </button>
          </div>
        );
      case TicketStatus.FIXING:
        return (
          <div className="flex gap-2">
            <button 
                onClick={() => setIsResolveModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
            >
                <CheckCircle size={16} /> Mark Resolved
            </button>
            <button 
                onClick={() => handleStatusChange(TicketStatus.INVESTIGATING)}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
                <ArrowLeftRight size={16} /> Return to Investigation
            </button>
          </div>
        );
      case TicketStatus.RESOLVED:
        return (
          <div className="flex gap-2">
             <button 
               onClick={() => handleStatusChange(TicketStatus.FIXING)}
               className="flex items-center gap-2 bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-200 transition shadow-sm"
             >
               <Wrench size={16} /> Re-open
             </button>
             <button 
               onClick={() => handleStatusChange(TicketStatus.CLOSED)}
               className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition shadow-sm"
             >
               <CheckCircle size={16} /> Close Ticket
             </button>
          </div>
        );
      case TicketStatus.CLOSED:
         return (
             <button 
               onClick={() => handleStatusChange(TicketStatus.OPEN)}
               className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
             >
               <History size={16} /> Re-activate
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
            {/* Visual Feedback for Status Updates */}
            {statusFeedback && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                    <CheckCircle size={12} className="text-green-600" />
                    {statusFeedback}
                </div>
            )}
          </div>
          <p className="text-slate-500">{ticket.title}</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm text-sm font-medium"
                title="Print Work Order"
            >
                <Printer size={16} /> <span className="hidden sm:inline">Print</span>
            </button>
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in space-y-6">
              <div>
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

              {/* Add Note Section */}
              <div className="pt-6 border-t border-slate-100">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Add Internal Note / Update</label>
                 <div className="relative">
                    <textarea 
                        className="w-full border border-slate-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={2}
                        placeholder="Type updates here (e.g. 'Customer called, verified power is on')..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />
                    <button 
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                        className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Send size={16} />
                    </button>
                 </div>
                 <p className="text-xs text-slate-400 mt-2">Notes are added to the Activity History without changing ticket status.</p>
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
                    ticket.activityLog.map((event) => {
                      const colorClass = getActionColor(event.action);
                      const bgClass = colorClass.split(' ')[0];
                      
                      return (
                      <div key={event.id} className="relative pl-10 z-10 group">
                          {/* Timeline Dot */}
                          <div className={`absolute left-3 top-1 w-4 h-4 rounded-full border-4 ${bgClass.replace('bg-', 'border-')} bg-white`}></div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-blue-100 hover:shadow-sm transition">
                             <div className="flex-1 mr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-bold text-sm ${colorClass.split(' ')[2]}`}>{event.action}</h4>
                                </div>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                             </div>
                             
                             <div className="text-right mt-2 sm:mt-0 flex-shrink-0 min-w-[130px]">
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">
                                        {new Date(event.timestamp).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                        {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                
                                <div className="flex justify-end items-center gap-1.5 mt-3">
                                    <span className="text-[10px] text-slate-400">by</span>
                                    <div className="flex items-center gap-1 bg-slate-200 pr-2 pl-1 py-0.5 rounded-full">
                                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[9px] font-bold text-slate-600 uppercase shadow-sm">
                                            {event.user.charAt(0)}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">{event.user}</p>
                                    </div>
                                </div>
                             </div>
                          </div>
                      </div>
                    )})
                  ) : (
                    <div className="text-center py-8 pl-8">
                        <p className="text-sm text-slate-400 italic">No activity logged yet.</p>
                    </div>
                  )}
                </div>
             </div>
          )}

        </div>

        {/* RIGHT COLUMN (1/3) - STATIC METADATA & SMART INSIGHTS */}
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
                
                {/* DEVICE ID RELATIONSHIP */}
                {ticket.device_id && (
                <li className="flex items-start gap-3">
                  <Server className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">Affected Device</span>
                    <span className="font-medium text-slate-800 break-all">
                        {onNavigateToDevice ? (
                            <button 
                                onClick={() => onNavigateToDevice(ticket.device_id!)} 
                                className="text-blue-600 hover:underline flex items-start text-left gap-1 transition"
                                title="View Device Details"
                            >
                                <span className="font-semibold">{getDeviceName(ticket.device_id)}</span> <ExternalLink size={12} className="mt-1" />
                            </button>
                        ) : (
                            <span className="text-slate-700">{getDeviceName(ticket.device_id)}</span>
                        )}
                    </span>
                  </div>
                </li>
                )}

                {/* LINK ID RELATIONSHIP (Non-Customer) */}
                {ticket.link_id && !ticket.link_id.startsWith('CID') && (
                <li className="flex items-start gap-3">
                  <Activity className="text-slate-400 mt-0.5" size={18} />
                  <div>
                    <span className="block text-xs text-slate-500">Link / Circuit ID</span>
                    <span className="font-medium text-slate-800 break-all">
                       {ticket.link_id}
                    </span>
                  </div>
                </li>
                )}

                {/* CUSTOMER ID RELATIONSHIP */}
                {(ticket.type === 'Customer' || ticket.type === 'Billing' || (ticket.link_id && ticket.link_id.startsWith('CID'))) && (
                  <li className="flex items-start gap-3">
                     <Users className="text-slate-400 mt-0.5" size={18} />
                     <div>
                        <span className="block text-xs text-slate-500">Customer ID</span>
                        <span className="font-medium text-slate-800 break-all">
                            {ticket.link_id && ticket.link_id.startsWith('CID') ? (
                                <button 
                                    onClick={() => onNavigateToCustomer && onNavigateToCustomer(ticket.link_id!)} 
                                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                                >
                                    {ticket.link_id} <ExternalLink size={10} />
                                </button>
                            ) : 'N/A'}
                        </span>
                     </div>
                  </li>
                )}
                
                {/* INVOICE RELATIONSHIP */}
                {ticket.related_invoice_id && (
                    <li className="flex items-start gap-3">
                        <FileText className="text-slate-400 mt-0.5" size={18} />
                        <div>
                            <span className="block text-xs text-slate-500">Related Invoice</span>
                            {onNavigateToInvoice ? (
                                <button 
                                    onClick={() => onNavigateToInvoice(ticket.related_invoice_id!)}
                                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    {ticket.related_invoice_id} <ExternalLink size={10} />
                                </button>
                            ) : (
                                <span className="font-medium text-blue-600 flex items-center gap-1">
                                    {ticket.related_invoice_id} <LinkIcon size={10} />
                                </span>
                            )}
                        </div>
                    </li>
                )}

                {/* MAINTENANCE RELATIONSHIP */}
                {ticket.related_maintenance_id && (
                    <li className="flex items-start gap-3">
                        <Wrench className="text-orange-400 mt-0.5" size={18} />
                        <div>
                            <span className="block text-xs text-slate-500">Caused by Maintenance</span>
                            {onNavigateToMaintenance ? (
                                <button 
                                    onClick={() => onNavigateToMaintenance(ticket.related_maintenance_id!)}
                                    className="font-medium text-orange-600 hover:underline flex items-center gap-1"
                                >
                                    {ticket.related_maintenance_id} <ExternalLink size={10} />
                                </button>
                            ) : (
                                <span className="font-medium text-orange-600 flex items-center gap-1">
                                    {ticket.related_maintenance_id} <LinkIcon size={10} />
                                </span>
                            )}
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

           {/* SMART INSIGHTS SECTION */}
           {(suggestedKB.length > 0 || similarTickets.length > 0) && (
               <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl shadow-sm border border-blue-100">
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                       <Lightbulb size={16} className="text-yellow-500" /> Smart Suggestions
                   </h3>
                   
                   {/* KB SUGGESTIONS */}
                   {suggestedKB.length > 0 && (
                       <div className="mb-4">
                           <p className="text-xs font-semibold text-slate-500 mb-2">Recommended SOPs:</p>
                           <div className="space-y-2">
                               {suggestedKB.map(kb => (
                                   <div key={kb.id} className="bg-white p-2.5 rounded border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition">
                                       <div className="flex items-start gap-2">
                                           <BookOpen size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                           <p className="text-xs font-medium text-slate-800 line-clamp-2">{kb.title}</p>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}

                   {/* SIMILAR TICKETS */}
                   {similarTickets.length > 0 && (
                       <div>
                           <p className="text-xs font-semibold text-slate-500 mb-2">Similar Resolved Tickets:</p>
                           <div className="space-y-2">
                               {similarTickets.map(t => (
                                   <div key={t.id} className="bg-white p-2.5 rounded border border-slate-200 hover:border-green-300 hover:shadow-sm cursor-pointer transition">
                                       <div className="flex items-start gap-2">
                                           <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                           <div>
                                               <p className="text-xs font-medium text-slate-800">{t.title}</p>
                                               <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t.id}</p>
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
               </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
