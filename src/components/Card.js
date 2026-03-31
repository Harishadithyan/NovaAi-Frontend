import React from "react";

function Card({
  children,
  className = "",
  variant = "glass",   // default | glass | outline
  padding = "p-6",
  hover = true
}) {

  const base =
    "rounded-3xl transition-all duration-300";

  const variants = {
    default:
      "bg-white shadow-md",

    glass:
      `
      bg-white/10 
      backdrop-blur-xl 
      border border-white/20 
      shadow-[0_8px_40px_rgba(0,0,0,0.6)] 
      ring-1 ring-white/10
      `,

    outline:
      "bg-transparent border border-white/20",
  };

  const hoverEffect = hover
    ? "hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:-translate-y-1"
    : "";

  return (
    <div
      className={`
        ${base}
        ${variants[variant]}
        ${padding}
        ${hoverEffect}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;