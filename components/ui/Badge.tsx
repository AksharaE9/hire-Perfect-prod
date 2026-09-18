import React from 'react';
import { StatusChip, StatusVariant } from './StatusChip';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'error' | 'info' | 'cyan' | 'purple' | 'outline' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const mapVariantToStatus = (): StatusVariant => {
    switch (variant) {
      case 'success': return 'clean';
      case 'warning': return 'review';
      case 'danger':
      case 'error': return 'flagged';
      case 'primary':
      case 'info':
      case 'cyan':
      case 'purple': return 'signal';
      default: return 'neutral';
    }
  };

  return (
    <StatusChip
      variant={mapVariantToStatus()}
      size={size === 'lg' ? 'md' : size}
      className={className}
      {...props}
    >
      {children}
    </StatusChip>
  );
};

export default Badge;
