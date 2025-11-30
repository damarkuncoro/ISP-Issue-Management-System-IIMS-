
import React, { useState } from 'react';
import { DeviceType, DeviceStatus, UserRole } from '../types';
import { X, Upload, FileText, CheckCircle, AlertTriangle, Save, RefreshCw } from 'lucide-react';

interface ImportDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (devices: any[]) => void;
  userRole: UserRole;
}

const ImportDeviceModal: React.FC<ImportDeviceModalProps> = ({ isOpen, onClose, onImport, userRole }) => {
  const [csvContent, setCsvContent] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');

  if (!isOpen) return null;

  const parseCSV = () => {
    const lines = csvContent.trim().split('\n');
    const parsed = lines.map((line, index) => {
      // Expected Format: Name,Type,Model,MAC,SN,Location
      const parts = line.split(',');
      if (parts.length < 5) return null; // Invalid line

      return {
        id: `IMP-${Date.now()}-${index}`, // Temp ID
        name: parts[0]?.trim(),
        type: parts[1]?.trim() as DeviceType || DeviceType.ONU,
        model: parts[2]?.trim(),
        mac_address: parts[3]?.trim(),
        serial_number: parts[4]?.trim(),
        location: parts[5]?.trim() || 'Warehouse',
        ip_address: '', // Default empty for bulk import
        status: DeviceStatus.PENDING, // Always pending validation
        installed_by: userRole,
        last_updated: new Date().toISOString()
      };
    }).filter(item => item !== null);

    setPreviewData(parsed);
    setStep('PREVIEW');
  };

  const handleImport = () => {
    onImport(previewData);
    handleClose();
  };

  const handleClose = () => {
    setCsvContent('');
    setPreviewData([]);
    setStep('INPUT');
    onClose();
  };

  const loadSample = () => {
    const sample = `ONU-Cluster-A-01, ONU, ZTE F609, AA:BB:CC:11:22:33, ZTEGC0FFEE01, Cluster A
ONU-Cluster-A-02, ONU, ZTE F609, AA:BB:CC:11:22:34, ZTEGC0FFEE02, Cluster A
SW-DIST-05, Switch, Cisco 2960, 00:11:22:33:44:55, FOC12345678, POP Bekasi`;
    setCsvContent(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Upload size={20} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Bulk Device Import</h3>
                <p className="text-xs text-slate-500">Add multiple assets via CSV</p>
             </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
            {step === 'INPUT' ? (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                        <p className="font-bold text-slate-700 mb-2">CSV Format Guidelines:</p>
                        <code className="block bg-slate-800 text-green-400 p-3 rounded font-mono text-xs mb-2">
                            Name, Type, Model, MAC Address, Serial Number, Location
                        </code>
                        <p className="text-slate-500 text-xs">Example: <span className="font-mono bg-white px-1 border rounded">ONU-01, ONU, ZTE F609, AA:BB:CC:DD:EE:FF, ZTE12345, Server Room</span></p>
                        <button onClick={loadSample} className="text-blue-600 text-xs font-bold mt-2 hover:underline">Load Sample Data</button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Paste CSV Data</label>
                        <textarea 
                            className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Paste your CSV content here..."
                            value={csvContent}
                            onChange={(e) => setCsvContent(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-700">Preview ({previewData.length} items)</h4>
                        <button onClick={() => setStep('INPUT')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <RefreshCw size={12} /> Edit Data
                        </button>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Model</th>
                                    <th className="px-4 py-2">MAC / SN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {previewData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-medium text-slate-800">{item.name}</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{item.type}</span>
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{item.model}</td>
                                        <td className="px-4 py-2 font-mono text-xs text-slate-500">
                                            <div>{item.mac_address}</div>
                                            <div className="text-slate-400">{item.serial_number}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex gap-2 text-xs text-yellow-800">
                        <AlertTriangle size={16} className="flex-shrink-0" />
                        <p>All imported devices will be set to <strong>Pending Validation</strong> status until approved by NOC.</p>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
                Cancel
            </button>
            {step === 'INPUT' ? (
                <button 
                    onClick={parseCSV}
                    disabled={!csvContent.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    <FileText size={18} /> Parse Data
                </button>
            ) : (
                <button 
                    onClick={handleImport}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-bold shadow-sm"
                >
                    <Save size={18} /> Import {previewData.length} Devices
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImportDeviceModal;
