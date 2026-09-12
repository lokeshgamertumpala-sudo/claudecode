import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [status, setStatus] = useState('allClear');

  return (
    <AlertContext.Provider value={{ status, setStatus }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertStore = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertStore must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;
