import { TrendingUpIcon } from "lucide-react";

interface StatsCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  trend?: React.ReactNode;
  color: "primary" | "success" | "warning" | "danger";
}

export const StatsCard = ({ icon, title, value, trend, color }: StatsCardProps) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4">
    <div className={`mb-2 inline-flex rounded-lg bg-${color}-50 p-2 text-${color}-600`}>{icon}</div>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-1 flex items-baseline justify-between">
      <p className="text-2xl font-semibold">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 text-xs text-${color}-600`}>
          <TrendingUpIcon className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  </div>
);
