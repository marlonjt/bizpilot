import React from "react";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl transform transition-all">
        <h2 className="text-white text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6">{message}</p>

        <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
