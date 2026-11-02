import React from 'react'

const Dock = ({ children, className = '' }) => {
  return (
    <footer className={`glass w-full px-8 py-8 ${className}`}>
      <div className="flex justify-center gap-8">
        {children}
      </div>
    </footer>
  )
}

export default Dock
