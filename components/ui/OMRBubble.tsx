import React from 'react';

export interface OMRBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  letter?: string;
  filled?: boolean;
  variant?: 'signal' | 'omr';
  size?: 'sm' | 'md' | 'lg';
}

export const OMRBubble: React.FC<OMRBubbleProps> = ({
  letter,
  filled = false,
  variant = 'signal',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const fillStyles = filled
    ? variant === 'omr'
      ? 'bg-omr text-white border-omr'
      : 'bg-signal text-white border-signal'
    : 'bg-sheet text-ink border-rule-strong hover:border-graphite';

  return (
    <div
      className={`rounded-full border-2 font-semibold flex items-center justify-center transition-all duration-150 shrink-0 select-none ${sizeStyles[size]} ${fillStyles} ${className}`}
      aria-hidden={!letter}
      {...props}
    >
      {letter && <span>{letter}</span>}
    </div>
  );
};

export default OMRBubble;
