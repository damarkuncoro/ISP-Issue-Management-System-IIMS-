
import React, { useRef, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Bell, Info, Trash2 } from 'lucide-react';
import { Notification } from './NotificationToast';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClear: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onClear }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'error': return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning': return <Bell size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div ref={panelRef} className="absolute top-14 right-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
            {notifications.length > 0 && (
                <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Trash2 size={12} /> Clear
                </button>
            )}
        </div>
        <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                    <Bell size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No recent notifications.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {notifications.map((notif, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50 transition flex gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                                {getIcon(notif.type)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1 text-right">Just now</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default NotificationPanel;
