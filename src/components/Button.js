import React from 'react'

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = ""
}) {

  const base =
    "rounded-xl font-semibold transition-all duration-300 focus:outline-none"

  const variants = {
    primary:
      `
      bg-primary text-black 
      shadow-[0_0_15px_#08CB00]
      hover:shadow-[0_0_30px_#08CB00]
      hover:scale-[1.02]
      `,

    secondary:
      `
      bg-secondary text-white 
      border border-white/20
      hover:bg-white
      hover:text-secondary
      `,

    outline:
      `
      border border-primary text-primary 
      hover:bg-primary hover:text-black
      `,

    ghost:
      `
      text-primary hover:bg-white/10
      `,

    danger:
      `
      bg-red-600 text-white 
      hover:bg-red-500
      `,
  }

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2",
    lg: "px-6 py-3 text-lg"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${base}
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading ? "Loading..." : children}
    </button>
  )
}

export default Button;