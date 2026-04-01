export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition";

  const styles = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow",
    secondary: "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50",
    dark: "bg-black text-white hover:bg-gray-900",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
