import React from "react";

function Input({
  label,
  type = "text",
  placeholder,
  onChange,
  error,
  disabled = false,
  value
}) {
  return (
    <div className="flex flex-col gap-2 w-full">

      {label && (
        <label className="text-sm font-medium text-white/80">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        disabled={disabled}
        className={`
          w-full px-4 py-3 
          rounded-xl 
          bg-white/20 
          backdrop-blur-md 
          border 
          text-white 
          placeholder-gray-300
          transition-all duration-300
          
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500"
              : "border-white/30 focus:ring-2 focus:ring-primary"
          }

          ${disabled ? "opacity-50 cursor-not-allowed" : ""}

          hover:bg-white/30
          focus:outline-none
        `}
      />

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

    </div>
  );
}

export default Input;