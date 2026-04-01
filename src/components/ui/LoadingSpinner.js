export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="h-full w-full animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>
  );
}
