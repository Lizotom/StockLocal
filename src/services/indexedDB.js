const DB_NAME = 'stocklocal-db';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const PENDING_STORE = 'pending';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveProductsOffline(products) {
  const db = await openDB();
  const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
  const store = tx.objectStore(PRODUCTS_STORE);

  store.clear();
  products.forEach((product) => store.put(product));

  await waitForTransaction(tx);
}

export async function getProductsOffline() {
  const db = await openDB();
  const tx = db.transaction(PRODUCTS_STORE, 'readonly');
  const store = tx.objectStore(PRODUCTS_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function upsertProductOffline(product) {
  const db = await openDB();
  const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
  tx.objectStore(PRODUCTS_STORE).put(product);
  await waitForTransaction(tx);
}

export async function deleteProductOffline(id) {
  const db = await openDB();
  const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
  tx.objectStore(PRODUCTS_STORE).delete(id);
  await waitForTransaction(tx);
}

export async function savePendingAction(action) {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  tx.objectStore(PENDING_STORE).add(action);
  await waitForTransaction(tx);
}

export async function getPendingActions() {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readonly');
  const store = tx.objectStore(PENDING_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePendingAction(id) {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  tx.objectStore(PENDING_STORE).delete(id);
  await waitForTransaction(tx);
}

export async function clearPendingActions() {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  tx.objectStore(PENDING_STORE).clear();
  await waitForTransaction(tx);
}
