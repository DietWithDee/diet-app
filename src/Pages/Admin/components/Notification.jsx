import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'error':
      default:
        return 'bg-red-50 border-red-500 text-red-800';
    }
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${getStyles()}`}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
