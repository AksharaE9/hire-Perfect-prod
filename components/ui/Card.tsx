import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'paper' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-sheet border border-rule shadow-subtle',
    paper: 'bg-paper border border-rule',
    interactive: 'bg-sheet border border-rule hover:border-rule-strong hover:shadow-floating transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={`rounded-card ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
