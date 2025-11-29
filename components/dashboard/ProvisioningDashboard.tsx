
import React from 'react';
import { Customer, Device, CustomerStatus, DeviceStatus, UserRole } from '../../types';
import { UserCheck, Server, CheckCircle, Clock, ArrowRight, ShieldAlert, Wifi } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProvisioningDashboardProps {
  customers: Customer[];
  devices: Device[];
  onNavigateToCustomer: (customer: Customer) => void;
  onValidateDevice: (device: Device) => void; // Usually navigates to Inventory
}

const StatCard = ({ title, value, subtext, icon, colorClass, active }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string, active?: boolean }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border ${active ? 'border-purple-400 ring-2 ring-purple-50' : 'border-slate-200'} flex items-start justify-between transition-all hover:shadow-md`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const ProvisioningDashboard: React.FC<ProvisioningDashboardProps> = ({ customers, devices, onNavigateToCustomer, onValidateDevice }) => {
  // Filter Queues
  const activationQueue = customers.filter(c => c.status === CustomerStatus.VERIFIED);
  const deviceQueue = devices.filter(d => d.status === DeviceStatus.PENDING);
  
  const activeToday = customers.filter(c => c.status === CustomerStatus.ACTIVE && new Date(c.last_updated).getDate() === new Date().getDate());
  
  const chartData = [
    { name: 'Pending Cust', value: activationQueue.length },
    { name: 'Pending Dev', value: deviceQueue.length },
    { name: 'Activated', value: activeToday.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-xl p-8 text-white shadow-lg flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold mb-2">Provisioning Center</h2>
                <p className="opacity-90 text-lg">You have <span className="font-bold text-yellow-300">{activationQueue.length} customers</span> and <span className="font-bold text-yellow-300">{deviceQueue.length} devices</span> waiting for configuration.</p>
            </div>
            <div className="hidden md:block opacity-80">
                <Wifi size={64} />
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatCard 
                title="Activation Queue" 
                value={activationQueue.length} 
                subtext="Docs Verified, Waiting Config"
                icon={<UserCheck size={24} />}
                colorClass="text-blue-600"
                active={activationQueue.length > 0}
              />
              <StatCard 
                title="Device Validation" 
                value={deviceQueue.length} 
                subtext="Installed, Waiting IP"
                icon={<Server size={24} />}
                colorClass="text-orange-600"
                active={deviceQueue.length > 0}
              />
               <StatCard 
                title="Activated Today" 
                value={activeToday.length} 
                subtext="Successful Provisioning"
                icon={<CheckCircle size={24} />}
                colorClass="text-green-600"
              />
              <StatCard 
                title="Avg Time to Live" 
                value="45m" 
                subtext="From Verification to Active"
                icon={<Clock size={24} />}
                colorClass="text-slate-600"
              />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Customer Activation Queue */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-blue-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck size={18} className="text-blue-600" /> Customer Activations
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{activationQueue.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                    {activationQueue.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                            <CheckCircle size={48} className="text-slate-200 mb-2" />
                            <p>All customers processed.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {activationQueue.map(customer => (
                                <div key={customer.id} className="p-4 hover:bg-slate-50 transition cursor-pointer group" onClick={() => onNavigateToCustomer(customer)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-700">{customer.name}</span>
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">VERIFIED</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        {customer.package_name} • {customer.address}
                                    </div>
                                    <button className="w-full py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Provision Now <ArrowRight size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMN 2: Device Validation Queue */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                 <div className="p-5 border-b border-slate-100 bg-orange-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Server size={18} className="text-orange-600" /> Device Validations
                    </h4>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">{deviceQueue.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                     {deviceQueue.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                            <CheckCircle size={48} className="text-slate-200 mb-2" />
                            <p>All devices validated.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                             {deviceQueue.map(device => (
                                <div key={device.id} className="p-4 hover:bg-slate-50 transition cursor-pointer group" onClick={() => onValidateDevice(device)}>
                                     <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-700">{device.model}</span>
                                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">PENDING</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                        SN: {device.serial_number} <span className="text-slate-300">|</span> {device.location}
                                    </div>
                                     <div className="flex items-center gap-2 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                                        <ShieldAlert size={12} className="text-orange-500" />
                                        <span className="text-[10px] text-slate-600">IP Address Required</span>
                                    </div>
                                    <button className="w-full mt-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-200 rounded hover:bg-slate-300 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Review & Activate
                                    </button>
                                </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>

             {/* COLUMN 3: Performance & Summary */}
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-4">Backlog Overview</h4>
                    <div className="h-48 w-full min-w-0">
                         <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                             <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} allowDecimals={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                             </BarChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Quick Actions</h4>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-purple-400 hover:text-purple-600 transition shadow-sm">
                            Assign Static IP Block
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-purple-400 hover:text-purple-600 transition shadow-sm">
                            View OLT Port Capacity
                        </button>
                         <button className="w-full text-left px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-purple-400 hover:text-purple-600 transition shadow-sm">
                            Bulk Provisioning Tool
                        </button>
                    </div>
                </div>
             </div>

        </div>
    </div>
  );
};

export default ProvisioningDashboard;
