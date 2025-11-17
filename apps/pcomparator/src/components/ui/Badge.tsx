import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "info";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  default: "bg-primary-50 text-primary-700 ring-primary-600/10",
  secondary: "bg-gray-50 text-gray-600 ring-gray-500/10",
  success: "bg-green-50 text-green-700 ring-green-600/10",
  info: "bg-blue-50 text-blue-700 ring-blue-600/10"
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-sm"
};

export const Badge = ({ children, variant = "default", size = "sm", className }: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center font-medium ring-1 ring-inset rounded-md",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
  >
    {children}
  </span>
);
