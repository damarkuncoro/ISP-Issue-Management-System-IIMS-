
import React, { useState } from 'react';
import { Employee, EmployeeStatus, UserRole } from '../types';
import { Users, UserPlus, Search, Briefcase, Mail, Phone, Calendar, XCircle, UserCheck, UserX, Edit, Filter } from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  userRole: UserRole;
  onAddEmployee: (data: any) => void;
  onUpdateEmployee: (id: string, data: any) => void;
  onSelectEmployee?: (employee: Employee) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, userRole, onAddEmployee, onUpdateEmployee, onSelectEmployee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [managerFilter, setManagerFilter] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: 'Operations',
    role: UserRole.FIELD,
    status: EmployeeStatus.ACTIVE,
    join_date: new Date().toISOString().split('T')[0],
    reports_to: ''
  });

  // Access Control: Only HRD and Manager can view. Only HRD can Edit.
  if (userRole !== UserRole.HRD && userRole !== UserRole.MANAGER) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-slate-200">
         <XCircle size={48} className="text-red-400 mb-4" />
         <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
         <p className="text-slate-500">Employee Data is confidential. Please contact HRD.</p>
      </div>
    );
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesText = 
      emp.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
      emp.position.toLowerCase().includes(filterText.toLowerCase()) ||
      emp.department.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesManager = managerFilter ? emp.reports_to === managerFilter : true;

    return matchesText && matchesManager;
  });

  const handleOpenAdd = () => {
    setModalMode('ADD');
    setEditingId(null);
    setFormData({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        department: 'Operations',
        role: UserRole.FIELD,
        status: EmployeeStatus.ACTIVE,
        join_date: new Date().toISOString().split('T')[0],
        reports_to: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation(); // Prevent card click
    setModalMode('EDIT');
    setEditingId(employee.id);
    setFormData({ ...employee, reports_to: employee.reports_to || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'ADD') {
        onAddEmployee(formData);
    } else if (modalMode === 'EDIT' && editingId) {
        onUpdateEmployee(editingId, formData);
    }
    setIsModalOpen(false);
  };

  const canEdit = userRole === UserRole.HRD;

  // Potential Managers list (exclude self if editing)
  const availableManagers = employees.filter(e => editingId ? e.id !== editingId : true);

  // Get manager name helper
  const getManagerName = (managerId?: string) => {
    if (!managerId) return null;
    const mgr = employees.find(e => e.id === managerId);
    return mgr ? mgr.full_name : 'Unknown';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* EMPLOYEE MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-800">
                 {modalMode === 'ADD' ? 'Add New Employee' : 'Edit Employee Record'}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">x</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                      <input required type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. NOC Engineer" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                      <input required type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.join_date} onChange={e => setFormData({...formData, join_date: e.target.value})} />
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

               {modalMode === 'EDIT' && (
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as EmployeeStatus})}>
                         {Object.values(EmployeeStatus).map(st => (
                            <option key={st} value={st}>{st}</option>
                         ))}
                      </select>
                  </div>
               )}

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {modalMode === 'ADD' ? 'Add Employee' : 'Save Changes'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Employee Management (HRIS)</h2>
            <p className="text-slate-500">Manage staff directory, roles, and status.</p>
         </div>
         {canEdit && (
            <button 
                onClick={handleOpenAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
            >
                <UserPlus size={20} /> Add Employee
            </button>
         )}
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search Employee Name, Position..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
         </div>
         <div className="relative min-w-[200px]">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                <Filter size={18} />
            </div>
            <select 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 appearance-none bg-transparent"
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
            >
                <option value="">All Managers</option>
                {employees.map(e => (
                    <option key={e.id} value={e.id}>Reports to: {e.full_name}</option>
                ))}
            </select>
         </div>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredEmployees.map(emp => (
            <div 
              key={emp.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer relative group"
              onClick={() => onSelectEmployee && onSelectEmployee(emp)}
            >
               {canEdit && (
                  <button 
                    onClick={(e) => handleOpenEdit(e, emp)}
                    className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-600 transition z-10"
                    title="Edit Employee"
                  >
                    <Edit size={16} />
                  </button>
               )}

               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                        {emp.full_name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800">{emp.full_name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{emp.id}</p>
                     </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                      emp.status === EmployeeStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                      emp.status === EmployeeStatus.ON_LEAVE ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                      {emp.status}
                  </span>
               </div>
               
               <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                     <Briefcase size={16} className="text-slate-400" />
                     <span>{emp.position}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                     <Users size={16} className="text-slate-400" />
                     <span>{emp.department}</span>
                  </div>
                   <div className="flex items-center gap-3 text-sm text-slate-600">
                     <Mail size={16} className="text-slate-400" />
                     <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.reports_to && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <UserCheck size={16} className="text-slate-400" />
                        <span>Reports to: <span className="font-medium text-slate-800">{getManagerName(emp.reports_to)}</span></span>
                    </div>
                  )}
               </div>
               
               <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                   <div className="text-xs text-slate-500">
                       Access Role: <span className="font-semibold text-slate-700">{emp.role}</span>
                   </div>
                   <span className="text-blue-600 text-xs font-medium group-hover:underline">View Profile</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default EmployeeManagement;
