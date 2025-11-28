
import React, { useState } from 'react';
import { ServicePlan, UserRole } from '../types';
import { Plus, Edit2, Archive, DollarSign, Activity, Zap, CheckCircle, XCircle } from 'lucide-react';

interface ServicePlanManagerProps {
  plans: ServicePlan[];
  userRole: UserRole;
  onAddPlan: (plan: any) => void;
}

const ServicePlanManager: React.FC<ServicePlanManagerProps> = ({ plans, userRole, onAddPlan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ServicePlan>>({
    name: '',
    speed_mbps: 0,
    price: 0,
    sla_percentage: 98.0,
    category: 'Residential',
    description: '',
    fup_quota_gb: 0,
    active: true
  });

  // Only Product Managers or General Managers can access this
  if (userRole !== UserRole.PRODUCT_MANAGER && userRole !== UserRole.MANAGER) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-slate-200">
         <XCircle size={48} className="text-red-400 mb-4" />
         <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
         <p className="text-slate-500">Only Product Managers can configure Service Plans.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlan(formData);
    setIsModalOpen(false);
    setFormData({
        name: '',
        speed_mbps: 0,
        price: 0,
        sla_percentage: 98.0,
        category: 'Residential',
        description: '',
        fup_quota_gb: 0,
        active: true
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ADD PLAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-800">Create New Service Plan</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">x</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                  <input required type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Super Gamer 100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Speed (Mbps)</label>
                      <input required type="number" className="w-full px-4 py-2 border rounded-lg" value={formData.speed_mbps} onChange={e => setFormData({...formData, speed_mbps: Number(e.target.value)})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price (IDR)</label>
                      <input required type="number" className="w-full px-4 py-2 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">SLA (%)</label>
                      <input required type="number" step="0.1" max="100" className="w-full px-4 py-2 border rounded-lg" value={formData.sla_percentage} onChange={e => setFormData({...formData, sla_percentage: Number(e.target.value)})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                         <option value="Residential">Residential</option>
                         <option value="SME">SME</option>
                         <option value="Corporate">Corporate</option>
                         <option value="Dedicated">Dedicated</option>
                      </select>
                  </div>
               </div>
               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">FUP Quota (GB)</label>
                   <input type="number" className="w-full px-4 py-2 border rounded-lg" placeholder="0 for Unlimited" value={formData.fup_quota_gb} onChange={e => setFormData({...formData, fup_quota_gb: Number(e.target.value)})} />
                   <p className="text-xs text-slate-400 mt-1">Leave 0 for Unlimited Data</p>
               </div>
               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                   <textarea rows={2} className="w-full px-4 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Publish Plan</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Product & Service Plans</h2>
            <p className="text-slate-500">Manage internet packages, pricing, and SLAs.</p>
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
         >
            <Plus size={20} /> Create New Plan
         </button>
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
               <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${plan.category === 'Dedicated' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {plan.category}
                     </span>
                     {plan.active ? (
                        <span className="text-xs flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={12} /> Active</span>
                     ) : (
                        <span className="text-xs flex items-center gap-1 text-slate-400 font-medium"><Archive size={12} /> Archived</span>
                     )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-slate-700">
                        <Zap size={18} className="text-amber-500" />
                        <span className="font-semibold">{plan.speed_mbps} Mbps</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-700">
                        <Activity size={18} className="text-blue-500" />
                        <span>SLA Guarantee: <span className="font-semibold">{plan.sla_percentage}%</span></span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-700">
                        <DollarSign size={18} className="text-green-500" />
                        <span className="text-lg font-bold text-slate-800">{formatCurrency(plan.price)} <span className="text-xs text-slate-400 font-normal">/ month</span></span>
                     </div>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
                  <button className="text-slate-500 hover:text-blue-600 p-2 hover:bg-white rounded-lg transition">
                     <Edit2 size={16} />
                  </button>
                  <button className="text-slate-500 hover:text-red-600 p-2 hover:bg-white rounded-lg transition">
                     <Archive size={16} />
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ServicePlanManager;
