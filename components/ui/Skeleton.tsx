import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  height = 'h-4',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-surface-container rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel border border-outline-variant rounded-xl p-6 shadow-lg shadow-black/30 space-y-4">
      <Skeleton className="w-1/3" height="h-6" />
      <Skeleton count={3} height="h-4" className="mb-2" />
      <Skeleton className="w-1/2" height="h-10" />
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="glass-panel border border-outline-variant rounded-xl p-4 flex items-center justify-between gap-4">
      <Skeleton className="w-1/4" height="h-4" />
      <Skeleton className="w-1/4" height="h-4" />
      <Skeleton className="w-1/4" height="h-4" />
      <Skeleton className="w-1/12" height="h-8" />
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
