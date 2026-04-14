import React, { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Reports from './pages/Reports.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';
import { syncPendingActions } from './services/sync.js';
import { APP_STORAGE_KEYS } from './services/config.js';
import {
  requestNotificationPermission,
  showAppNotification
} from './services/notifications.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem(APP_STORAGE_KEYS.user);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('No se pudo recuperar la sesión guardada:', error);
        localStorage.removeItem(APP_STORAGE_KEYS.user);
      }
    }
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      try {
        const syncedCount = await syncPendingActions();

        if (syncedCount > 0) {
          console.log(`Se sincronizaron ${syncedCount} acciones pendientes`);

          await showAppNotification('Sincronización completada', {
            body: `Se sincronizaron ${syncedCount} acción(es) pendiente(s).`,
            tag: 'sync-complete'
          });
        }
      } catch (error) {
        console.error('No se pudieron sincronizar las acciones pendientes', error);
      }
    };

    if (navigator.onLine) {
      handleOnline();
    }

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleLogin = async (userData) => {
    localStorage.setItem(APP_STORAGE_KEYS.user, JSON.stringify(userData));
    setUser(userData);

    const permission = await requestNotificationPermission();

    if (permission === 'granted') {
      await showAppNotification('Bienvenido a StockLocal', {
        body: `Hola ${userData.name}, las notificaciones ya están activas.`,
        tag: 'login-welcome'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(APP_STORAGE_KEYS.user);
    setUser(null);
    setView('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <ConnectionStatus />

      {view === 'dashboard' && (
        <Dashboard user={user} onNavigate={setView} onLogout={handleLogout} />
      )}

      {view === 'products' && (
        <Products user={user} onNavigate={setView} onLogout={handleLogout} />
      )}

      {view === 'reports' && (
        <Reports user={user} onNavigate={setView} onLogout={handleLogout} />
      )}
    </>
  );
}
