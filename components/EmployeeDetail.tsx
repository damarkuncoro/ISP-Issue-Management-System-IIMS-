
import React, { useState } from 'react';
import { Employee, EmployeeStatus, UserRole } from '../types';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, Shield, MapPin, CheckCircle, Clock, Award, Activity, Edit, UserCheck, FileText, History } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';

interface EmployeeDetailProps {
  employee: Employee;
  userRole?: UserRole; // Optional because initially it wasn't passed, but useful for permission check
  onBack: () => void;
  onUpdateEmployee?: (id: string, data: any) => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, userRole, onBack, onUpdateEmployee }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'audit'>('profile');
  const [formData, setFormData] = useState<Partial<Employee>>({ ...employee });

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case EmployeeStatus.ON_LEAVE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case EmployeeStatus.TERMINATED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const calculateTenure = (dateString: string) => {
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
        return `${Math.floor(diffDays / 365)} Years, ${Math.floor((diffDays % 365) / 30)} Months`;
    }
    return `${Math.floor(diffDays / 30)} Months`;
  };

  const handleEditClick = () => {
    setFormData({ ...employee, reports_to: employee.reports_to || '' });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateEmployee) {
        onUpdateEmployee(employee.id, formData);
    }
    setIsEditModalOpen(false);
  };

  const canEdit = userRole === UserRole.HRD;

  // Ideally, this should come from a context or prop, but for this structure we import mock for lookup
  // In a real app, pass the full list of employees or a "getManager" function
  const allEmployees = MOCK_EMPLOYEES; 
  const availableManagers = allEmployees.filter(e => e.id !== employee.id);

  const getManagerName = (managerId?: string) => {
    if (!managerId) return null;
    const mgr = allEmployees.find(e => e.id === managerId);
    return mgr ? mgr.full_name : 'Unknown';
  };

  // Render specific stats based on the employee's role in the ISP
  const renderPerformanceStats = () => {
    if (employee.role === UserRole.SALES) {
        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase">Sales This Month</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">14 <span className="text-sm font-normal text-slate-500">New Subs</span></p>
                </div>
                 <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-600 uppercase">Conversion Rate</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">22% <span className="text-sm font-normal text-slate-500">Avg</span></p>
                </div>
            </div>
        );
    } 
    
    if (employee.role === UserRole.FIELD || employee.role === UserRole.NOC || employee.role === UserRole.NETWORK) {
        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-600 uppercase">Tickets Resolved</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">45 <span className="text-sm font-normal text-slate-500">This Month</span></p>
                </div>
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 uppercase">SLA Compliance</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">98.5% <span className="text-sm font-normal text-slate-500">On Time</span></p>
                </div>
            </div>
        );
    }

    if (employee.role === UserRole.CS) {
         return (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-xs font-bold text-orange-600 uppercase">Calls Handled</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">120 <span className="text-sm font-normal text-slate-500">This Week</span></p>
                </div>
                 <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                    <p className="text-xs font-bold text-teal-600 uppercase">Cust. Satisfaction</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">4.8 <span className="text-sm font-normal text-slate-500">/ 5.0</span></p>
                </div>
            </div>
        );
    }

    // Default for HR, Managers, etc.
    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
             <Activity className="text-slate-400" />
             <p className="text-sm text-slate-500">Performance metrics are managed in the external KPI dashboard.</p>
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-800">Edit Employee Record</h3>
               <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">x</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input required type="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Position / Title</label>
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                         <option value="Operations">Operations</option>
                         <option value="Network">Network</option>
                         <option value="Sales & Marketing">Sales & Marketing</option>
                         <option value="Human Resources">Human Resources</option>
                         <option value="Finance">Finance</option>
                      </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                         {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role}</option>
                         ))}
                      </select>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as EmployeeStatus})}>
                         {Object.values(EmployeeStatus).map(st => (
                            <option key={st} value={st}>{st}</option>
                         ))}
                      </select>
                  </div>
               </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reports To (Manager)</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg" 
                    value={formData.reports_to || ''} 
                    onChange={e => setFormData({...formData, reports_to: e.target.value})}
                  >
                     <option value="">-- No Direct Manager --</option>
                     {availableManagers.map(mgr => (
                        <option key={mgr.id} value={mgr.id}>{mgr.full_name} ({mgr.position})</option>
                     ))}
                  </select>
               </div>
               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                   <input required type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.join_date} onChange={e => setFormData({...formData, join_date: e.target.value})} />
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Employee Profile
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(employee.status)}`}>
              {employee.status}
            </span>
          </h2>
          <p className="text-slate-500 font-mono text-sm">{employee.id}</p>
        </div>
        {canEdit && (
            <button 
                onClick={handleEditClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
            >
                <Edit size={16} /> Edit Profile
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
          <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <UserCheck size={16} /> Profile & Stats
          </button>
          <button 
             onClick={() => setActiveTab('audit')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <History size={16} /> Audit Log
          </button>
      </div>

      {activeTab === 'profile' ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-slate-400 mb-4 border-4 border-white shadow-lg">
                    {employee.full_name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{employee.full_name}</h3>
                <p className="text-slate-500 font-medium">{employee.position}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                     <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"><Mail size={18} /></button>
                     <button className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition"><Phone size={18} /></button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact Information</h4>
                <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                        <Mail className="text-slate-400 mt-0.5" size={16} />
                        <div>
                            <span className="block text-xs text-slate-500">Email Address</span>
                            <span className="font-medium text-slate-800 break-all">{employee.email}</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <Phone className="text-slate-400 mt-0.5" size={16} />
                        <div>
                            <span className="block text-xs text-slate-500">Phone Number</span>
                            <span className="font-medium text-slate-800">{employee.phone}</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <MapPin className="text-slate-400 mt-0.5" size={16} />
                        <div>
                            <span className="block text-xs text-slate-500">Office Location</span>
                            <span className="font-medium text-slate-800">HQ - Jakarta</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        {/* Center & Right Column: Employment Details */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Job Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" /> Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Department</label>
                        <p className="text-lg font-medium text-slate-800 mt-1">{employee.department}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Current Position</label>
                        <p className="text-lg font-medium text-slate-800 mt-1">{employee.position}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Reports To</label>
                         <div className="flex items-center gap-2 mt-1">
                             <UserCheck size={18} className="text-slate-400" />
                            <p className="font-medium text-slate-800">
                                {employee.reports_to ? getManagerName(employee.reports_to) : 'N/A (Direct to Director)'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Join Date</label>
                        <div className="flex items-center gap-2 mt-1">
                            <Calendar size={18} className="text-slate-400" />
                            <p className="font-medium text-slate-800">{new Date(employee.join_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">Tenure</label>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={18} className="text-slate-400" />
                            <p className="font-medium text-slate-800">{calculateTenure(employee.join_date)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Award size={20} className="text-orange-500" /> Performance & KPI
                </h3>
                {renderPerformanceStats()}
            </div>

            {/* System Access */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-indigo-600" /> System Access & Permissions
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Assigned System Role</span>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{employee.role}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                        This role determines the user's ability to view, create, and edit Tickets, Customers, Devices, and other modules within the ISP Issue Manager.
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-600">
                         <div className="flex items-center gap-2">
                             <CheckCircle size={14} className="text-green-500" /> Login Enabled
                         </div>
                         <div className="flex items-center gap-2">
                             <CheckCircle size={14} className="text-green-500" /> VPN Access
                         </div>
                         <div className="flex items-center gap-2">
                             <CheckCircle size={14} className="text-green-500" /> Email Access
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" /> Change History Log
                </h3>
                <p className="text-sm text-slate-500">Audit trail of changes made to this employee record.</p>
            </div>
            {employee.auditLog && employee.auditLog.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Field Changed</th>
                                <th className="px-6 py-3">Old Value</th>
                                <th className="px-6 py-3">New Value</th>
                                <th className="px-6 py-3">Changed By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employee.auditLog.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-700 uppercase">
                                        {log.field.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-red-600 line-through text-xs">
                                        {log.old_value}
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-medium text-xs">
                                        {log.new_value}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                                            {log.changed_by}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center text-slate-500">
                    No changes have been recorded for this employee yet.
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
