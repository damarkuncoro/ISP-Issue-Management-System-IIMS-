
import React, { useState } from 'react';
import { Save, Bell, Clock, Globe, Database, RefreshCw, AlertTriangle, CheckCircle, MapPin, Link as LinkIcon, Hash } from 'lucide-react';

interface SettingsProps {
  onSave: (section: string, data: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sla' | 'notifications' | 'data'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Mock Initial State
  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'PT. Cakramedia Indocyber',
    asn: '24200',
    website: 'http://cakramedia.net.id',
    address: 'Cyber Building Lantai 5 Jl. Kuningan Barat Raya N0. 8 Jakarta Selatan 12710',
    region: 'Jakarta (WIB)',
    currency: 'IDR',
    supportPhone: '021-555-0199'
  });

  const [slaConfig, setSlaConfig] = useState({
    criticalResponseTime: 1, // hours
    criticalResolveTime: 4, // hours
    majorResolveTime: 24, // hours
    minorResolveTime: 72, // hours
    autoEscalate: true
  });

  const [notifConfig, setNotifConfig] = useState({
    enableWhatsapp: true,
    whatsappGatewayIP: '202.133.4.200',
    enableEmail: true,
    emailSmtp: 'smtp.gmail.com',
    notifyOnCritical: true,
    notifyOnResolve: true
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
        let dataToSave = {};
        if (activeTab === 'general') dataToSave = generalConfig;
        if (activeTab === 'sla') dataToSave = slaConfig;
        if (activeTab === 'notifications') dataToSave = notifConfig;

        onSave(activeTab, dataToSave);
        setIsSaving(false);
    }, 800);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'sla', label: 'SLA Configuration', icon: <Clock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={18} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
         <p className="text-slate-500">Manage global settings, service levels, and alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Sidebar Tabs */}
         <div className="lg:col-span-1 space-y-2">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-200">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">ISP Company Name</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                                value={generalConfig.companyName}
                                onChange={e => setGeneralConfig({...generalConfig, companyName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Hash size={14} /> ASN (Autonomous System)
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-700"
                                value={generalConfig.asn}
                                onChange={e => setGeneralConfig({...generalConfig, asn: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <LinkIcon size={14} /> Website URL
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-600"
                                value={generalConfig.website}
                                onChange={e => setGeneralConfig({...generalConfig, website: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <MapPin size={14} /> HQ Address
                            </label>
                            <textarea 
                                rows={2}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={generalConfig.address}
                                onChange={e => setGeneralConfig({...generalConfig, address: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Support Hotline</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={generalConfig.supportPhone}
                                onChange={e => setGeneralConfig({...generalConfig, supportPhone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Operating Region / Timezone</label>
                            <select 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                value={generalConfig.region}
                                onChange={e => setGeneralConfig({...generalConfig, region: e.target.value})}
                            >
                                <option>Jakarta (WIB)</option>
                                <option>Makassar (WITA)</option>
                                <option>Jayapura (WIT)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Base Currency</label>
                            <select 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                value={generalConfig.currency}
                                onChange={e => setGeneralConfig({...generalConfig, currency: e.target.value})}
                            >
                                <option>IDR (Rupiah)</option>
                                <option>USD (Dollar)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* SLA TAB */}
            {activeTab === 'sla' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-200">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Service Level Agreement (SLA) Thresholds</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 mb-4 flex gap-2">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        Changes here will affect how the system calculates ticket deadlines and escalation triggers.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Critical Ticket Resolve Time (Hours)</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={slaConfig.criticalResolveTime}
                                onChange={e => setSlaConfig({...slaConfig, criticalResolveTime: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Major Ticket Resolve Time (Hours)</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={slaConfig.majorResolveTime}
                                onChange={e => setSlaConfig({...slaConfig, majorResolveTime: Number(e.target.value)})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Minor Ticket Resolve Time (Hours)</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={slaConfig.minorResolveTime}
                                onChange={e => setSlaConfig({...slaConfig, minorResolveTime: Number(e.target.value)})}
                            />
                        </div>
                         <div className="flex items-center gap-2 mt-6">
                             <input 
                                type="checkbox" 
                                id="autoEscalate"
                                className="w-4 h-4 text-blue-600 rounded"
                                checked={slaConfig.autoEscalate}
                                onChange={e => setSlaConfig({...slaConfig, autoEscalate: e.target.checked})}
                             />
                             <label htmlFor="autoEscalate" className="text-sm font-medium text-slate-700">Enable Auto-Escalation to Manager</label>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-200">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Notification Gateways</h3>
                    
                    {/* WhatsApp */}
                    <div className="p-4 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <span className="bg-green-100 text-green-600 p-1.5 rounded"><Bell size={16} /></span>
                                WhatsApp Gateway
                            </h4>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle-wa" checked={notifConfig.enableWhatsapp} onChange={e => setNotifConfig({...notifConfig, enableWhatsapp: e.target.checked})} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-green-500" style={{right: notifConfig.enableWhatsapp ? 0 : 'auto'}}/>
                                <label htmlFor="toggle-wa" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${notifConfig.enableWhatsapp ? 'bg-green-500' : 'bg-slate-300'}`}></label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Gateway API Endpoint / IP</label>
                                <input 
                                    type="text" 
                                    disabled={!notifConfig.enableWhatsapp}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-mono disabled:bg-slate-100"
                                    value={notifConfig.whatsappGatewayIP}
                                    onChange={e => setNotifConfig({...notifConfig, whatsappGatewayIP: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="p-4 border border-slate-200 rounded-xl">
                         <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded"><Bell size={16} /></span>
                                Email SMTP
                            </h4>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle-email" checked={notifConfig.enableEmail} onChange={e => setNotifConfig({...notifConfig, enableEmail: e.target.checked})} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-500" style={{right: notifConfig.enableEmail ? 0 : 'auto'}}/>
                                <label htmlFor="toggle-email" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${notifConfig.enableEmail ? 'bg-blue-500' : 'bg-slate-300'}`}></label>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">SMTP Server</label>
                                <input 
                                    type="text" 
                                    disabled={!notifConfig.enableEmail}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-mono disabled:bg-slate-100"
                                    value={notifConfig.emailSmtp}
                                    onChange={e => setNotifConfig({...notifConfig, emailSmtp: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-2">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={notifConfig.notifyOnCritical} onChange={e => setNotifConfig({...notifConfig, notifyOnCritical: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500"/>
                             <span className="text-sm text-slate-700">Alert on Critical Tickets</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={notifConfig.notifyOnResolve} onChange={e => setNotifConfig({...notifConfig, notifyOnResolve: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500"/>
                             <span className="text-sm text-slate-700">Alert on Resolved</span>
                         </label>
                    </div>
                </div>
            )}

            {/* DATA TAB */}
            {activeTab === 'data' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-200">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Data Management</h3>
                    
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800">Export System Report</h4>
                            <p className="text-sm text-slate-500 mt-1">Download logs, tickets, and asset summary as CSV.</p>
                        </div>
                        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm">
                            Download .CSV
                        </button>
                    </div>

                    <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-red-800">Factory Reset Simulation</h4>
                            <p className="text-sm text-red-700 mt-1">Reset all mock data to initial state. <span className="font-bold">This cannot be undone.</span></p>
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-sm flex items-center gap-2">
                            <RefreshCw size={18} /> Reset Data
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Action */}
            {activeTab !== 'data' && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 transition flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save size={18} /> Save Settings
                            </>
                        )}
                    </button>
                </div>
            )}

         </div>
      </div>
    </div>
  );
};

export default Settings;
