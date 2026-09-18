import React from 'react';

export type StatusVariant = 'clean' | 'review' | 'flagged' | 'signal' | 'neutral' | 'roadmap';

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = true,
  className = '',
  ...props
}) => {
  const variantStyles = {
    clean: 'bg-clean-soft text-clean border-clean/20',
    review: 'bg-review-soft text-review border-review/20',
    flagged: 'bg-flagged-soft text-flagged border-flagged/20',
    signal: 'bg-signal-soft text-signal border-signal/20',
    neutral: 'bg-paper text-graphite border-rule',
    roadmap: 'bg-paper text-graphite border-dashed border-rule-strong',
  };

  const dotColors = {
    clean: 'bg-clean',
    review: 'bg-review',
    flagged: 'bg-flagged',
    signal: 'bg-signal',
    neutral: 'bg-graphite',
    roadmap: 'bg-graphite/60',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-chip border select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
};

export default StatusChip;
