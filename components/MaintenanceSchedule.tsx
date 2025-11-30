
import React, { useState, useEffect } from 'react';
import { Maintenance, MaintenanceStatus, UserRole } from '../types';
import { Calendar, Plus, Clock, MapPin, AlertTriangle, CheckCircle, X, Wrench, Megaphone } from 'lucide-react';

interface MaintenanceScheduleProps {
  maintenanceList: Maintenance[];
  userRole: UserRole;
  onAddMaintenance: (data: any) => void;
  onUpdateStatus: (id: string, status: MaintenanceStatus) => void;
  highlightId?: string;
}

const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ maintenanceList, userRole, onAddMaintenance, onUpdateStatus, highlightId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Maintenance>>({
    title: '',
    type: 'Software Patch',
    affected_area: '',
    start_time: '',
    end_time: '',
    description: '',
    status: MaintenanceStatus.SCHEDULED
  });

  const canEdit = userRole === UserRole.NOC || userRole === UserRole.NETWORK || userRole === UserRole.MANAGER;

  // Optional: Auto-scroll or bring the highlighted item to top could be implemented here
  // For now, we'll sort or filter to show highlighted item first if needed, 
  // but just adding a visual highlight class is sufficient for this requirement.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaintenance(formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({
        title: '',
        type: 'Software Patch',
        affected_area: '',
        start_time: '',
        end_time: '',
        description: '',
        status: MaintenanceStatus.SCHEDULED
    });
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case MaintenanceStatus.IN_PROGRESS: return 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse';
      case MaintenanceStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case MaintenanceStatus.CANCELLED: return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-800">Schedule Planned Maintenance</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Title</label>
                  <input required type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Core Router Upgrade" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                         <option>Software Patch</option>
                         <option>Hardware Upgrade</option>
                         <option>Fiber Relocation</option>
                         <option>Emergency</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Affected Area</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Region / POP" value={formData.affected_area} onChange={e => setFormData({...formData, affected_area: e.target.value})} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                      <input required type="datetime-local" className="w-full px-4 py-2 border rounded-lg" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                      <input required type="datetime-local" className="w-full px-4 py-2 border rounded-lg" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                  </div>
               </div>
               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Description & Impact</label>
                   <textarea required rows={3} className="w-full px-4 py-2 border rounded-lg" placeholder="Details of activity and expected impact..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
               
               <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex gap-2 text-xs text-yellow-800">
                   <Megaphone size={16} />
                   <p>This will send a notification to all affected customers if confirmed.</p>
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Calendar size={16} /> Schedule
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Maintenance Schedule</h2>
            <p className="text-slate-500">Planned downtime, upgrades, and maintenance windows.</p>
         </div>
         {canEdit && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
            >
                <Plus size={20} /> Schedule Maintenance
            </button>
         )}
      </div>

      {/* LIST */}
      <div className="space-y-4">
         {maintenanceList.map(item => (
             <div 
                key={item.id} 
                className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all ${
                    highlightId === item.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
             >
                 {/* Left Indicator Strip */}
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                     item.status === MaintenanceStatus.SCHEDULED ? 'bg-blue-500' :
                     item.status === MaintenanceStatus.IN_PROGRESS ? 'bg-orange-500' :
                     item.status === MaintenanceStatus.COMPLETED ? 'bg-green-500' : 'bg-slate-300'
                 }`}></div>

                 <div className="flex-1">
                     <div className="flex items-start justify-between mb-2">
                         <div className="flex items-center gap-3">
                             <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(item.status)}`}>{item.status}</span>
                         </div>
                         <span className="text-xs font-mono text-slate-400">{item.id}</span>
                     </div>
                     <p className="text-slate-600 text-sm mb-4">{item.description}</p>
                     
                     <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                         <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                             <Wrench size={14} />
                             {item.type}
                         </div>
                         <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                             <MapPin size={14} />
                             {item.affected_area}
                         </div>
                         <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                             <Clock size={14} />
                             {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleTimeString()}
                         </div>
                     </div>
                 </div>

                 {/* Actions */}
                 {canEdit && item.status !== MaintenanceStatus.COMPLETED && item.status !== MaintenanceStatus.CANCELLED && (
                     <div className="flex flex-col justify-center gap-2 border-l border-slate-100 pl-6">
                         {item.status === MaintenanceStatus.SCHEDULED && (
                             <button 
                                onClick={() => onUpdateStatus(item.id, MaintenanceStatus.IN_PROGRESS)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-2 w-full justify-center"
                             >
                                 Start Work
                             </button>
                         )}
                         {item.status === MaintenanceStatus.IN_PROGRESS && (
                             <button 
                                onClick={() => onUpdateStatus(item.id, MaintenanceStatus.COMPLETED)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 w-full justify-center"
                             >
                                 <CheckCircle size={16} /> Complete
                             </button>
                         )}
                         <button 
                            onClick={() => onUpdateStatus(item.id, MaintenanceStatus.CANCELLED)}
                            className="px-4 py-2 text-slate-500 hover:text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg w-full"
                         >
                             Cancel
                         </button>
                     </div>
                 )}
             </div>
         ))}
         
         {maintenanceList.length === 0 && (
             <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                 No maintenance scheduled.
             </div>
         )}
      </div>
    </div>
  );
};

export default MaintenanceSchedule;
