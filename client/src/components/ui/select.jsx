import * as React from "react";

export function Select({ value, onChange, options = [], placeholder = "Select..." }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
