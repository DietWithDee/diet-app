import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${type === 'success'
        ? 'bg-green-50 border-green-500 text-green-800'
        : 'bg-red-50 border-red-500 text-red-800'
      }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
