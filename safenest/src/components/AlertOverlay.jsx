import React, { useEffect, useState } from 'react';
import { useAlertStore } from '../state/useAlertStore.jsx';
import { speakAlert, setMute } from '../lib/speech';

const AlertOverlay = ({ status, onClear }) => {
  const { status: storeStatus } = useAlertStore();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (storeStatus === 'alert') {
      speakAlert('flood'); // For demo, we'll use flood alert. In reality, we'd pass the type.
    }
    // We'll clean up by cancelling speech? Not implemented in speech.js yet.
    return () => {
      // Optionally, cancel speech if needed
    };
  }, [storeStatus]);

  if (storeStatus !== 'alert') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">
      <div className="glass-dark rounded-t-2xl w-full max-w-xl p-6 space-y-4 relative">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-weight-semibold text-coral">Flood Warning for Hyderabad</h2>
          <div className="flex gap-2">
            <button
              onClick={onClear}
              className="btn-circle bg-coral/20 text-coral hover:bg-coral/30"
              aria-label="Clear alert"
            >
              ✕
            </button>
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                setMute(!isMuted); // Pass the new muted state
              }}
              className="btn-circle bg-gray-200/20 text-gray-200 hover:bg-gray-200/30"
              aria-label="Mute/unmute"
            >
              {isMuted ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
        <p className="text-muted">
          SafeNest alert. Flood warning for Hyderabad. Stay inside. Do not walk in water. I can help you call your family or official helpline 1 1 2.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => alert('Calling family...')}
            className="btn-pill bg-amber/20 text-amber hover:bg-amber/30"
          >
            Call Family
          </button>
          <button
            onClick={() => alert('Calling helpline 112...')}
            className="btn-pill bg-mint/20 text-mint hover:bg-mint/30"
          >
            Call Helpline
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertOverlay;
