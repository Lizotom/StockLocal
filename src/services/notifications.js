const DEFAULT_ICON = '/icons/icon-192.png';
const DEFAULT_BADGE = '/icons/icon-192.png';

export function isNotificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationsSupported()) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('No se pudo solicitar permiso de notificaciones:', error);
    return 'default';
  }
}

export async function showAppNotification(title, options = {}) {
  if (!isNotificationsSupported()) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions = {
    body: '',
    icon: DEFAULT_ICON,
    badge: DEFAULT_BADGE,
    tag: 'stocklocal-notification',
    renotify: false,
    data: {
      url: '/'
    },
    ...options
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, notificationOptions);
      return true;
    }

    const notification = new Notification(title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('No se pudo mostrar la notificación:', error);
    return false;
  }
}