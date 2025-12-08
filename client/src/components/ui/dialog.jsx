import * as React from "react";

export function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative w-11/12 md:w-2/3 lg:w-1/2">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:text-red-400 text-xl font-bold"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
