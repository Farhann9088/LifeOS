
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>

      <div className="stat-value">{value}</div>
      <p>{subtitle}</p>
    </div>
  );
}
