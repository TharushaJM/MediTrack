import * as React from "react";

export const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children, ...props }) => (
  <div {...props} className="border border-gray-300 rounded-md p-2 flex justify-between items-center">
    {children}
  </div>
);

export const SelectValue = ({ placeholder }) => <span className="text-gray-500">{placeholder}</span>;

export const SelectContent = ({ children }) => <div className="bg-white rounded-md shadow-md">{children}</div>;

export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);
