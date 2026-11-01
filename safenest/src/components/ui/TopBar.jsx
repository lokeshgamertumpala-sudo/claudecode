import React from 'react'
import CircleButton from './CircleButton'

const TopBar = ({ city = 'HYDERABAD', onClick, statusLabel }) => {
  return (
    <header className="flex-between w-full px-8 pt-8 pb-8">
      <div>
        <span className="text-xs uppercase tracking-wider text-muted">
          {city}
        </span>
      </div>

      <CircleButton
        onClick={onClick}
        variant="primary"
        aria-label={statusLabel || 'Status'}
      >
      </CircleButton>
    </header>
  )
}

export default TopBar
