// Demo alert engine for SafeNest
// This is a demo cache, not a live government feed.

// Demo data will be loaded from hyderabadDemo.json
let demoData = null;

// In a real app, we would fetch this data periodically.
// For demo, we'll simulate by having a static data and functions to change status.

export const loadDemoData = async () => {
  try {
    const response = await fetch('/data/hyderabadDemo.json');
    demoData = await response.json();
  } catch (error) {
    console.error('Failed to load demo data:', error);
    // Fallback demo data
    demoData = {
      status: 'allClear',
      lastUpdated: new Date().toISOString(),
      message: 'All systems normal'
    };
  }
};

export const getAlertStatus = () => {
  if (!demoData) {
    return 'allClear';
  }
  return demoData.status;
};

export const simulateFloodAlert = () => {
  demoData = {
    status: 'alert',
    lastUpdated: new Date().toISOString(),
    message: 'Flood warning for Hyderabad. Stay inside. Do not walk in water.',
    type: 'flood'
  };
};

export const simulateHeatAlert = () => {
  demoData = {
    status: 'alert',
    lastUpdated: new Date().toISOString(),
    message: 'Heat warning for Hyderabad. Stay hydrated. Avoid direct sunlight.',
    type: 'heat'
  };
};

export const setWatchStatus = () => {
  demoData = {
    status: 'watch',
    lastUpdated: new Date().toISOString(),
    message: 'Monitoring conditions for potential risks.',
    type: 'watch'
  };
};

export const setAllClear = () => {
  demoData = {
    status: 'allClear',
    lastUpdated: new Date().toISOString(),
    message: 'All systems normal. No active warnings.',
    type: 'allClear'
  };
};

// Initialize demo data on load
if (typeof window !== 'undefined') {
  loadDemoData();
}

export default {
  loadDemoData,
  getAlertStatus,
  simulateFloodAlert,
  simulateHeatAlert,
  setWatchStatus,
  setAllClear
};
