import { getPendingActions, deletePendingAction } from './indexedDB.js';
import { API_URL } from './config.js';

export async function syncPendingActions() {
  const actions = await getPendingActions();

  if (!actions.length) {
    return 0;
  }

  let syncedCount = 0;

  for (const action of actions) {
    if (action.type === 'CREATE') {
      const response = await fetch(`${API_URL}?endpoint=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload)
      });

      if (!response.ok) {
        throw new Error('No se pudo sincronizar una creación pendiente');
      }
    }

    if (action.type === 'UPDATE') {
      const response = await fetch(`${API_URL}?endpoint=products&id=${action.payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload)
      });

      if (!response.ok) {
        throw new Error('No se pudo sincronizar una actualización pendiente');
      }
    }

    if (action.type === 'DELETE') {
      const response = await fetch(`${API_URL}?endpoint=products&id=${action.payload.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('No se pudo sincronizar una eliminación pendiente');
      }
    }

    await deletePendingAction(action.id);
    syncedCount += 1;
  }

  return syncedCount;
}
