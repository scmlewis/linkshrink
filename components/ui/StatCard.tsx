import { Card, CardContent } from './Card';

type StatColor = 'primary' | 'secondary' | 'tertiary' | 'primary-container';

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  color?: StatColor;
  className?: string;
}

const colorClasses: Record<StatColor, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  'primary-container': 'text-primary-container',
};

export function StatCard({ label, value, icon, color = 'primary', className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className={`text-3xl font-bold ${colorClasses[color]} mb-1 truncate`} title={value}>
              {value}
            </div>
            <div className="text-sm text-on-surface-variant">{label}</div>
          </div>
          {icon && (
            <span className={`material-symbols-outlined ${colorClasses[color]} text-3xl opacity-30 flex-shrink-0 ml-2`}>
              {icon}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
