import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'error': return <AlertTriangle size={20} className="text-red-500" />;
      case 'warning': return <Bell size={20} className="text-orange-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-orange-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <div className={`fixed top-20 right-6 z-50 w-80 bg-white rounded-lg shadow-xl border-l-4 ${getBorderColor()} p-4 animate-in slide-in-from-right duration-300 flex items-start gap-3`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800">{notification.title}</h4>
        <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationToast;