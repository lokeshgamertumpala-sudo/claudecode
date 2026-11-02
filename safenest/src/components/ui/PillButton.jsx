import React from 'react'

const PillButton = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn-pill flex-center uppercase tracking-wider'
  const variantClasses = {
    default: '',
    primary: 'bg-mint text-bg',
    amber: 'bg-amber text-bg',
    coral: 'bg-coral text-bg'
  }[variant] || ''

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }[size] || 'px-4 py-2 text-sm'

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

export default PillButton
