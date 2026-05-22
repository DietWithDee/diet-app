import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, itemName, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100">
        {/* Header */}
        <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-100">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertTriangle size={24} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{title || "Confirm Delete"}</h3>
            <p className="text-xs font-semibold text-red-600 mt-1 uppercase tracking-wider">Warning: Permanent Action</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
          {itemName && (
            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Item Selected</span>
              <span className="text-sm font-bold text-gray-800 break-words mt-1 block">{itemName}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg font-semibold transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
