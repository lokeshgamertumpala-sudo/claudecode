import React from 'react'

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass ${className}`} {...props}>
      {children}
    </div>
  )
}

export default GlassCard
