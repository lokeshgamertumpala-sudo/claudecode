import React from 'react';

const StatusHero = ({ status }) => {
  const statusConfig = {
    allClear: {
      label: 'All Clear',
      color: 'text-mint',
      icon: '✅',
      bg: 'bg-mint/20'
    },
    watch: {
      label: 'Watch',
      color: 'text-amber',
      icon: '👀',
      bg: 'bg-amber/20'
    },
    alert: {
      label: 'Alert',
      color: 'text-coral',
      icon: '⚠️',
      bg: 'bg-coral/20'
    }
  };

  const config = statusConfig[status] || statusConfig.allClear;

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className={`${config.bg} rounded-full p-4`}>
        <span className="text-4xl">{config.icon}</span>
      </div>
      <h1 className={`text-2xl font-weight-semibold ${config.color}`}>
        {config.label}
      </h1>
      <p className="text-muted max-w-md">
        Hyderabad is currently {status === 'allClear' ? 'safe and calm.' : status === 'watch' ? 'under observation for potential risks.' : 'experiencing an active alert. Follow safety instructions.'}
      </p>
    </div>
  );
};

export default StatusHero;
