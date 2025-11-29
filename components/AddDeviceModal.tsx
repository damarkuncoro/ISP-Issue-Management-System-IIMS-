
import React, { useState, useEffect } from 'react';
import { DeviceType, DeviceStatus, UserRole, Device } from '../types';
import { X, Save, Server, Shield } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deviceData: any) => void;
  onUpdate?: (id: string, deviceData: any) => void;
  userRole: UserRole;
  device?: Device | null; // If provided, we are in Edit Mode
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onSubmit, onUpdate, userRole, device }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: DeviceType.ROUTER,
    model: '',
    ip_address: '',
    mac_address: '',
    serial_number: '',
    location: '',
  });

  const isEditMode = !!device;

  useEffect(() => {
    if (device) {
        setFormData({
            name: device.name,
            type: device.type,
            model: device.model,
            ip_address: device.ip_address,
            mac_address: device.mac_address,
            serial_number: device.serial_number,
            location: device.location
        });
    } else {
        // Reset for Add Mode
        setFormData({
            name: '',
            type: DeviceType.ROUTER,
            model: '',
            ip_address: '',
            mac_address: '',
            serial_number: '',
            location: '',
        });
    }
  }, [device, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && device && onUpdate) {
        onUpdate(device.id, formData);
    } else {
        onSubmit(formData);
    }
    onClose();
  };

  // RBAC LOGIC
  const isNetworkAdmin = userRole === UserRole.NETWORK || userRole === UserRole.INVENTORY_ADMIN || userRole === UserRole.NOC || userRole === UserRole.MANAGER;
  
  // Field Techs can Add, but if Editing, they have limited rights.
  // Network Admins have full rights.
  const canEditConfig = !isEditMode || isNetworkAdmin; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Server size={20} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">
                    {isEditMode ? 'Edit Device Configuration' : 'Register New Device'}
                </h3>
                <p className="text-xs text-slate-500">
                    {isNetworkAdmin ? 'Authorized Access: Full Control' : 'Restricted Access: Location/Info Only'}
                </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!canEditConfig && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-amber-700 text-xs font-medium">
                  <Shield size={14} />
                  Network configuration fields are locked for your role.
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hostname / Device Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. CORE-JKT-01"
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
                disabled={!canEditConfig}
              >
                {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model / Hardware</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="e.g. CCR1036"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                disabled={!canEditConfig}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IP Address</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="192.168.1.1"
                  value={formData.ip_address}
                  onChange={e => setFormData({...formData, ip_address: e.target.value})}
                  disabled={!canEditConfig}
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
                  disabled={!canEditConfig}
                />
             </div>
          </div>

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
                  disabled={!canEditConfig}
                />
             </div>
             <div>
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
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Save size={18} /> 
              {isEditMode ? 'Save Changes' : (isNetworkAdmin ? 'Register Active Device' : 'Submit for Validation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceModal;
