import React, { useEffect, useState } from 'react';
import { getPendingActions } from '../services/indexedDB.js';

export default function ConnectionStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = async () => {
    try {
      const pending = await getPendingActions();
      setPendingCount(pending.length);
    } catch (error) {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setOnline(true);
      setTimeout(refreshPendingCount, 600);
    };

    const handleOffline = () => {
      setOnline(false);
      refreshPendingCount();
    };

    const interval = window.setInterval(refreshPendingCount, 5000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online && pendingCount === 0) {
    return null;
  }

  return (
    <div className={`connection-banner ${online ? 'online' : 'offline'}`} role="status">
      <strong>{online ? 'Conexión recuperada' : 'Modo offline activo'}</strong>
      <span>
        {online
          ? `${pendingCount} acción(es) pendiente(s) se sincronizarán automáticamente.`
          : 'Puedes consultar y modificar productos guardados localmente. Los cambios se enviarán cuando vuelva internet.'}
      </span>
    </div>
  );
}
