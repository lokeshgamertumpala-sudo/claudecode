import React from 'react'

const CircleButton = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn-circle flex-center'
  const variantClasses = {
    default: '',
    primary: 'bg-mint text-bg',
    amber: 'bg-amber text-bg',
    coral: 'bg-coral text-bg'
  }[variant] || ''

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }[size] || 'w-10 h-10 text-sm'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default CircleButton
