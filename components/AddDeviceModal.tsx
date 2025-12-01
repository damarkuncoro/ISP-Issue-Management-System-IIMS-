
import React, { useState, useEffect } from 'react';
import { DeviceType, DeviceStatus, UserRole, Device, Customer } from '../types';
import { X, Save, Server, Shield, Camera, FileCheck, AlertTriangle, CheckCircle, Zap, Info, User, Network } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deviceData: any) => void;
  onUpdate?: (id: string, deviceData: any) => void;
  userRole: UserRole;
  device?: Device | null; // If provided, we are in Edit Mode
  customers?: Customer[]; // List of customers for selection
  allDevices?: Device[]; // List of all devices for Uplink selection
  preSelectedCustomerId?: string; // Auto select if adding from Customer Detail
  preFilledIp?: string; // Added: Auto fill IP from IPAM
}

// --- SMART VALIDATION DATABASE ---
// In a real app, this would come from a database table 'device_models'
const DEVICE_CATALOG: Record<string, { brand: string; wifi: 'Single' | 'Dual' | '6'; max_speed: number; type: 'Residential' | 'Bridge' }> = {
  'ZTE F609': { brand: 'ZTE', wifi: 'Single', max_speed: 50, type: 'Residential' },
  'ZTE F609 V3': { brand: 'ZTE', wifi: 'Single', max_speed: 50, type: 'Residential' },
  'ZTE F670L': { brand: 'ZTE', wifi: 'Dual', max_speed: 500, type: 'Residential' },
  'ZTE F6600': { brand: 'ZTE', wifi: '6', max_speed: 1000, type: 'Residential' },
  'ZTE F601': { brand: 'ZTE', wifi: 'Single', max_speed: 1000, type: 'Bridge' }, // Pure ONT
  'HUAWEI HG8245H': { brand: 'Huawei', wifi: 'Single', max_speed: 50, type: 'Residential' },
  'HUAWEI HG8245A': { brand: 'Huawei', wifi: 'Single', max_speed: 40, type: 'Residential' },
  'HUAWEI HG8145V5': { brand: 'Huawei', wifi: 'Dual', max_speed: 600, type: 'Residential' },
  'HUAWEI K562': { brand: 'Huawei', wifi: '6', max_speed: 1200, type: 'Residential' },
  'HUAWEI HG8240': { brand: 'Huawei', wifi: 'Single', max_speed: 1000, type: 'Bridge' },
};

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onSubmit, onUpdate, userRole, device, customers = [], allDevices = [], preSelectedCustomerId, preFilledIp }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: DeviceType.ONU, // Default to ONU as it's the most common install
    model: '',
    ip_address: '',
    mac_address: '',
    serial_number: '',
    location: '',
    installation_photo: '',
    customer_id: '',
    uplink_device_id: '',
  });

  // --- INSTALLATION CONTEXT (Simulating Work Order Data) ---
  const [installContext, setInstallContext] = useState({
    targetSpeed: 20, // Mbps
    oltBrand: 'ZTE', // Infrastructure context
    customerType: 'Residential' // or Corporate
  });

  const [validationMsg, setValidationMsg] = useState<{type: 'success' | 'warning' | 'error', text: string} | null>(null);

  const isEditMode = !!device;
  const isPendingValidation = device?.status === DeviceStatus.PENDING;

  useEffect(() => {
    if (device) {
        setFormData({
            name: device.name,
            type: device.type,
            model: device.model,
            ip_address: device.ip_address,
            mac_address: device.mac_address,
            serial_number: device.serial_number,
            location: device.location,
            installation_photo: device.installation_photo || '',
            customer_id: device.customer_id || '',
            uplink_device_id: device.uplink_device_id || '',
        });
    } else {
        // Reset for Add Mode
        setFormData({
            name: '',
            type: DeviceType.ONU,
            model: '',
            ip_address: preFilledIp || '', // Use preFilledIp if available
            mac_address: '',
            serial_number: '',
            location: '',
            installation_photo: '',
            customer_id: preSelectedCustomerId || '',
            uplink_device_id: '',
        });
        
        // Auto-fill location if customer is selected
        if (preSelectedCustomerId && customers.length > 0) {
            const cust = customers.find(c => c.id === preSelectedCustomerId);
            if (cust) {
                setFormData(prev => ({
                    ...prev,
                    location: cust.address,
                    name: `ONU - ${cust.name}`
                }));
            }
        }
        
        setValidationMsg(null);
    }
  }, [device, isOpen, preSelectedCustomerId, customers, preFilledIp]);

  // --- SMART VALIDATION LOGIC ---
  useEffect(() => {
    if (!formData.model || formData.type !== DeviceType.ONU) {
        setValidationMsg(null);
        return;
    }

    const modelUpper = formData.model.toUpperCase();
    // Simple matching logic
    const matchedKey = Object.keys(DEVICE_CATALOG).find(k => modelUpper.includes(k));
    
    if (!matchedKey) {
        // Unknown device
        setValidationMsg(null); 
        return;
    }

    const specs = DEVICE_CATALOG[matchedKey];
    const issues: string[] = [];

    // 1. Check Brand Compatibility (OLT vs ONU)
    if (installContext.oltBrand.toUpperCase() !== specs.brand.toUpperCase()) {
        issues.push(`Vendor Mismatch: Installing ${specs.brand} ONU on ${installContext.oltBrand} OLT is not recommended.`);
    }

    // 2. Check Bandwidth Capability
    if (installContext.targetSpeed > specs.max_speed) {
        issues.push(`Bottleneck: ${matchedKey} (Max ${specs.max_speed}Mbps) cannot handle ${installContext.targetSpeed}Mbps plan.`);
    } else if (installContext.targetSpeed >= 50 && specs.wifi === 'Single') {
        issues.push(`WiFi Performance: Single Band WiFi struggles above 50Mbps. Recommended: Dual Band.`);
    }

    // 3. Check Customer Type
    if (installContext.customerType === 'Corporate' && specs.type === 'Residential') {
        issues.push(`Mode Mismatch: Corporate usually requires Bridge ONT, but this is a Residential Router.`);
    }

    if (issues.length > 0) {
        setValidationMsg({ type: 'warning', text: issues.join(' ') });
    } else {
        setValidationMsg({ type: 'success', text: `Perfect Match! ${matchedKey} is suitable for this installation.` });
    }

  }, [formData.model, formData.type, installContext]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let submissionData = { ...formData };
    
    if (isEditMode && device && onUpdate) {
        onUpdate(device.id, submissionData);
    } else {
        onSubmit(submissionData);
    }
    onClose();
  };

  // RBAC LOGIC
  const isNetworkAdmin = userRole === UserRole.NETWORK || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.NOC || userRole === UserRole.MANAGER;
  
  const canEditIP = isNetworkAdmin; 
  const canEditPhysical = !isEditMode || isNetworkAdmin || (isEditMode && device?.status === DeviceStatus.PENDING); 

  // Determine Recommendation String
  const getRecommendation = () => {
    let rec = "";
    if (installContext.targetSpeed < 50) rec += "Single Band ONU";
    else if (installContext.targetSpeed <= 300) rec += "Dual Band AC ONU";
    else rec += "WiFi 6 AX ONU";

    rec += ` (${installContext.oltBrand} Compatible)`;
    return rec;
  };

  // Filter potential uplink devices (Exclude self)
  const potentialUplinks = allDevices.filter(d => 
    d.id !== device?.id && 
    (d.type === DeviceType.OLT || d.type === DeviceType.SWITCH || d.type === DeviceType.ROUTER)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Server size={20} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">
                    {isEditMode ? 'Device Configuration' : 'Install New Device'}
                </h3>
                <p className="text-xs text-slate-500">
                    {isNetworkAdmin ? 'Full Access: Provisioning & Validation' : 'Field Access: Installation & Validation'}
                </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* NOC Notification for Pending Devices */}
          {isPendingValidation && isNetworkAdmin && (
             <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2 text-yellow-800 text-xs font-medium mb-2">
                  <FileCheck size={16} className="mt-0.5" />
                  <div>
                    <span className="font-bold block">Validation Required</span>
                    Review physical installation data and assign IP Address to activate.
                  </div>
              </div>
          )}

          {/* --- SMART CONTEXT SECTION (For Field Techs) --- */}
          {!isEditMode && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-blue-500" /> Work Order Context
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Target Plan Speed</label>
                        <select 
                            className="w-full text-xs border rounded p-1.5"
                            value={installContext.targetSpeed}
                            onChange={e => setInstallContext({...installContext, targetSpeed: Number(e.target.value)})}
                        >
                            <option value={20}>20 Mbps (Entry)</option>
                            <option value={50}>50 Mbps (Basic)</option>
                            <option value={100}>100 Mbps (Fast)</option>
                            <option value={300}>300 Mbps (Turbo)</option>
                        </select>
                    </div>
                    <div>
                         <label className="text-[10px] text-slate-500 block mb-1">Upstream OLT Brand</label>
                         <select 
                            className="w-full text-xs border rounded p-1.5"
                            value={installContext.oltBrand}
                            onChange={e => setInstallContext({...installContext, oltBrand: e.target.value})}
                        >
                            <option value="ZTE">ZTE (Cluster A)</option>
                            <option value="Huawei">Huawei (Cluster B)</option>
                            <option value="VSol">VSol (Rural)</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs bg-blue-100 text-blue-800 p-2 rounded border border-blue-200">
                    <Info size={14} />
                    <span>Recommended: <strong>{getRecommendation()}</strong></span>
                </div>
            </div>
          )}

          {/* CUSTOMER & UPLINK */}
          <div className="grid grid-cols-1 gap-4">
             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <User size={14} /> Owner / Customer (Optional)
                 </label>
                 <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                    value={formData.customer_id}
                    onChange={e => setFormData({...formData, customer_id: e.target.value})}
                    disabled={!!preSelectedCustomerId} // Lock if adding from customer page
                 >
                    <option value="">-- No Customer Assigned (Backbone) --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                 </select>
             </div>
             
             {/* UPLINK SELECTION (TOPOLOGY) */}
             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Network size={14} className="text-purple-600" /> Uplink Device (Parent)
                 </label>
                 <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                    value={formData.uplink_device_id}
                    onChange={e => setFormData({...formData, uplink_device_id: e.target.value})}
                 >
                    <option value="">-- No Uplink / Root Device --</option>
                    {potentialUplinks.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.ip_address}) - {d.type}</option>
                    ))}
                 </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hostname / Device Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. ONU-CID-2501"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Device Type</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as DeviceType})}
                disabled={!canEditPhysical}
              >
                {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model / Hardware</label>
              <div className="relative">
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 uppercase placeholder:normal-case"
                    placeholder="e.g. ZTE F609"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    disabled={!canEditPhysical}
                  />
                  {/* Validation Icon */}
                  {validationMsg && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {validationMsg.type === 'success' ? <CheckCircle size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-amber-500" />}
                      </div>
                  )}
              </div>
            </div>
          </div>

          {/* Validation Message Box */}
          {validationMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  validationMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                  {validationMsg.type === 'success' ? <CheckCircle size={14} className="mt-0.5" /> : <AlertTriangle size={14} className="mt-0.5" />}
                  <span className="font-medium">{validationMsg.text}</span>
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number (S/N)</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Mfg Serial"
                  value={formData.serial_number}
                  onChange={e => setFormData({...formData, serial_number: e.target.value})}
                  disabled={!canEditPhysical}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">MAC Address</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm uppercase disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="AA:BB:CC:DD:EE:FF"
                  value={formData.mac_address}
                  onChange={e => setFormData({...formData, mac_address: e.target.value})}
                  disabled={!canEditPhysical}
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Site / POP"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
             </div>
             <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    IP Address 
                    {!canEditIP && <Shield size={12} className="text-amber-500" />}
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder={canEditIP ? "192.168.1.1" : "Assigned by NOC"}
                  value={formData.ip_address}
                  onChange={e => setFormData({...formData, ip_address: e.target.value})}
                  disabled={!canEditIP}
                />
                {!canEditIP && <p className="text-[10px] text-slate-400 mt-1">Managed by Network Engineering.</p>}
             </div>
          </div>
          
          {/* Installation Photo Upload (Mock) */}
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                 <Camera size={16} className="text-slate-500" /> Installation Photo / BA
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                  {formData.installation_photo ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                          <FileCheck size={18} /> Photo Attached
                          <button type="button" onClick={() => setFormData({...formData, installation_photo: ''})} className="text-red-500 text-xs hover:underline ml-2">Remove</button>
                      </div>
                  ) : (
                      <div onClick={() => setFormData({...formData, installation_photo: 'mock-photo-url'})}>
                          <p className="text-sm text-slate-500">Click to upload photo of installed device</p>
                          <p className="text-xs text-slate-400">(Rack view, cabling, or sticker)</p>
                      </div>
                  )}
              </div>
          </div>

        </form>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Save size={18} /> 
              {isEditMode 
                 ? (isPendingValidation && isNetworkAdmin ? 'Validate & Activate' : 'Save Changes')
                 : 'Submit Installation'
              }
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddDeviceModal;
