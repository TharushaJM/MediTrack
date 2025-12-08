import * as React from "react";

export const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 w-full 
      bg-white dark:bg-gray-700 
      text-gray-900 dark:text-gray-100
      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
      focus:outline-none focus:border-transparent
      transition-colors"
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children, className, ...props }) => (
  <div 
    {...props} 
    className={`border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 flex justify-between items-center 
      bg-white dark:bg-gray-700 
      text-gray-900 dark:text-gray-100
      cursor-pointer hover:border-blue-500 dark:hover:border-blue-400
      transition-colors ${className || ''}`}
  >
    {children}
  </div>
);

export const SelectValue = ({ placeholder }) => (
  <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
);

export const SelectContent = ({ children, className }) => (
  <div className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg ${className || ''}`}>
    {children}
  </div>
);

export const SelectItem = ({ value, children }) => (
  <option 
    value={value}
    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    {children}
  </option>
);

