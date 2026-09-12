import React from 'react';
import { useAlertStore } from '../state/useAlertStore.jsx';
import StatusHero from '../components/StatusHero';
import GlassCard from '../components/ui/GlassCard';
import CircleButton from '../components/ui/CircleButton';
import PillButton from '../components/ui/PillButton';
import AlertOverlay from '../components/AlertOverlay';
import alertEngine from '../lib/alertEngine';

const Home = () => {
  const { status, setStatus } = useAlertStore();

  const handleSimulateFlood = () => {
    alertEngine.simulateFloodAlert();
    setStatus('alert');
  };

  const handleSimulateHeat = () => {
    alertEngine.simulateHeatAlert();
    setStatus('alert');
  };

  const handleAskAI = () => {
    // Placeholder for AI chat (not implemented yet)
    alert('Ask AI feature coming soon');
  };

  const handleFamily = () => {
    // Placeholder for Family
    alert('Family feature coming soon');
  };

  const handleSafetyMode = () => {
    // Placeholder for Safety Mode
    alert('Safety Mode feature coming soon');
  };

  return (
    <GlassCard className="flex min-h-[calc(100%-4rem)] flex-col items-center justify-center p-6 gap-4">
      <StatusHero status={status} />
      <div className="flex flex-wrap gap-4 justify-center">
        <CircleButton onClick={handleAskAI} variant="primary" size="lg">
          <span className="text-xl">🤖</span>
        </CircleButton>
        <CircleButton onClick={handleSimulateFlood} variant="amber" size="lg">
          <span className="text-xl">🌊</span>
        </CircleButton>
        <CircleButton onClick={handleSimulateHeat} variant="coral" size="lg">
          <span className="text-xl">🔥</span>
        </CircleButton>
        <CircleButton onClick={handleFamily} variant="primary" size="lg">
          <span className="text-xl">👨‍👩‍👧‍👦</span>
        </CircleButton>
        <CircleButton onClick={handleSafetyMode} variant="primary" size="lg">
          <span className="text-xl">🛡️</span>
        </CircleButton>
      </div>
      <AlertOverlay status={status} onClear={() => {
        alertEngine.setAllClear();
        setStatus('allClear');
      }} />
    </GlassCard>
  );
};

export default Home;
