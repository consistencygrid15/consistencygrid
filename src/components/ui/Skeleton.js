export default function Skeleton({ className = "", variant = "default" }) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  const variants = {
    default: "",
    text: "h-4",
    title: "h-6",
    card: "h-32",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24",
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
}
