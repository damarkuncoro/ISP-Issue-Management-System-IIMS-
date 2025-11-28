import React, { useState } from 'react';
import { Ticket, TicketStatus, Severity } from '../types';
import { STATUS_COLORS } from '../constants';
import { AIAnalysisResult, analyzeTicketWithGemini } from '../services/geminiService';
import { 
  ArrowLeft, MapPin, Server, Users, Clock, AlertTriangle, 
  CheckCircle, Play, UserPlus, PenTool, Sparkles, MessageSquare,
  History
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: TicketStatus) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onBack, onUpdateStatus }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeTicketWithGemini(ticket);
    setAiResult(result);
    setIsAnalyzing(false);
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
               onClick={() => onUpdateStatus(ticket.id, TicketStatus.ASSIGNED)}
               className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <UserPlus size={16} /> Assign Engineer
            </button>
            <button 
               onClick={() => onUpdateStatus(ticket.id, TicketStatus.RESOLVED)}
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
            onClick={() => onUpdateStatus(ticket.id, TicketStatus.RESOLVED)}
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
        {/* Left Column: Details & AI */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" /> Description & Logs
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-slate-700 leading-relaxed">{ticket.description}</p>
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

          {/* AI Analysis Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" /> AI Diagnostic Assistant
              </h3>
              {!aiResult && ticket.status !== TicketStatus.CLOSED && (
                <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                </button>
              )}
            </div>
            
            {aiResult ? (
               <div className="space-y-4 animate-in fade-in">
                  <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                    <h4 className="font-semibold text-indigo-900 text-sm mb-1">Root Cause Analysis</h4>
                    <p className="text-slate-700 text-sm">{aiResult.rootCause}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                        <h4 className="font-semibold text-green-900 text-sm mb-1">Recommended Action</h4>
                        <p className="text-slate-700 text-sm">{aiResult.recommendedAction}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
                        <h4 className="font-semibold text-orange-900 text-sm mb-1">Estimated Fix</h4>
                        <p className="text-slate-700 text-sm">{aiResult.estimatedFixTime}</p>
                    </div>
                  </div>
               </div>
            ) : (
              <p className="text-sm text-indigo-400 italic">
                {isAnalyzing ? 'Gathering insights from system logs and knowledge base...' : 'Run analysis to get root cause suggestions and fix recommendations.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & History */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Ticket Info</h3>
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
                    <span className="font-medium text-slate-800">{ticket.device_id || ticket.link_id || 'N/A'}</span>
                  </div>
                </li>
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
           
           {/* Timeline */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <History size={16} /> Activity History
             </h3>
             <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-2 before:bg-slate-200 before:w-0.5 before:ml-px">
                {ticket.activityLog && ticket.activityLog.length > 0 ? (
                  ticket.activityLog.map((event) => (
                    <div key={event.id} className="relative pl-6">
                        <div className="absolute left-0 mt-1 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-white"></div>
                        <p className="text-xs text-slate-500 mb-0.5">{new Date(event.timestamp).toLocaleString([], { hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'short' })}</p>
                        <h4 className="text-sm font-medium text-slate-800">{event.action}</h4>
                        <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1 italic">by {event.user}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic pl-4">No activity logged.</p>
                )}
             </div>
           </div>

           {ticket.assignee && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Assignee</h3>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                   {ticket.assignee.charAt(0)}
                 </div>
                 <div>
                   <p className="font-medium text-slate-800">{ticket.assignee}</p>
                   <p className="text-xs text-slate-500">Field Technician</p>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;