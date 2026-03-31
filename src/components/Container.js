// components/layout/AppContainer.jsx
import React from "react";

const Container = ({
  children,
  header,
  footer,
  center = false,
  direction = "col", // "row" | "col"
  justify = "start", // "start" | "center" | "between"
  align = "stretch", // "start" | "center" | "stretch"
  padding = "p-4",
  bg = "bg-gray-50",
  className = "",
}) => {
  const flexDirection = {
    row: "flex-row",
    col: "flex-col",
  };
  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    between: "justify-between",
  };
  const alignMap = {
    start: "items-start",
    center: "items-center",
    stretch: "items-stretch",
  };

  return (
    <div
      className={`
        min-h-screen w-full flex
        ${flexDirection[direction]}
        ${justifyMap[justify]}
        ${alignMap[align]}
        ${bg}
        ${className}
      `}
    >
      {/* Header */}
      {header && (
        <div className="w-full bg-white shadow-sm">
          {header}
        </div>
      )}

      {/* Main Content */}
      <main
        className={`
          flex-1 w-full
          ${center ? "flex items-center justify-center" : ""}
          ${padding}
        `}
      >
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <div className="w-full bg-white border-t p-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Container;