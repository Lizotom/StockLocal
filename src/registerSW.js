if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado correctamente');
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  });
}
