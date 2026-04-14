import { API_URL } from './config.js';

import {
  saveProductsOffline,
  getProductsOffline,
  savePendingAction,
  upsertProductOffline,
  deleteProductOffline
} from './indexedDB.js';

export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}?endpoint=products`);
    if (!response.ok) throw new Error('Error al consultar productos');

    const data = await response.json();
    await saveProductsOffline(data);
    return data;
  } catch (error) {
    console.warn('Sin conexión, usando datos offline');
    return await getProductsOffline();
  }
}

export async function createProduct(product) {
  try {
    const response = await fetch(`${API_URL}?endpoint=products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error('Error al guardar producto');
    return await response.json();
  } catch (error) {
    const offlineProduct = {
      ...product,
      id: Date.now()
    };
    await upsertProductOffline(offlineProduct);
    await savePendingAction({ type: 'CREATE', payload: product });
    return { offline: true };
  }
}

export async function updateProduct(id, product) {
  try {
    const response = await fetch(`${API_URL}?endpoint=products&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error('Error al actualizar producto');
    return await response.json();
  } catch (error) {
    await upsertProductOffline({ ...product, id });
    await savePendingAction({ type: 'UPDATE', payload: { id, ...product } });
    return { offline: true };
  }
}

export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}?endpoint=products&id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar producto');
    return await response.json();
  } catch (error) {
    await deleteProductOffline(id);
    await savePendingAction({ type: 'DELETE', payload: { id } });
    return { offline: true };
  }
}
