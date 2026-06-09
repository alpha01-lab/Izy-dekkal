import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, highlight }: StatCardProps) {
  return (
    <div className={cn(
      "bg-surface rounded-xl p-6 border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer",
      highlight ? "border-primary/50 relative overflow-hidden" : "border-border hover:border-primary/30"
    )}>
      {highlight && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
      )}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          highlight ? "bg-primary/10 text-primary" : "bg-background-subtle text-text-secondary"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap shrink-0",
            trend.isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-secondary mb-1 truncate" title={title}>{title}</p>
        <h3 className="text-xl xl:text-2xl font-bold text-text-primary tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
