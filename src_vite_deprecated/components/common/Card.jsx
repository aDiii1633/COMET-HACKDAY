import React from 'react';

export const Card = ({
  children,
  className = '',
  variant = 'default', // 'default' | 'interactive' | 'danger'
  onClick,
}) => {
  const variants = {
    default: 'glass-card',
    interactive: 'glass-card glass-card-interactive cursor-pointer',
    danger: 'glass-card glass-card-danger',
  };

  return (
    <div
      onClick={onClick}
      className={`${variants[variant]} p-5 ${className}`}
    >
      {children}
    </div>
  );
};
