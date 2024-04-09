function openIndexedDB(
  dbName: string,
  objectStoreName: string,
  version: number
) {
  return new Promise<IDBDatabase>((resolve) => {
    const idb = window.indexedDB;
    const request = idb.open(dbName, version);

    request.onerror = () => {
      throw new Error();
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(objectStoreName)) {
        db.createObjectStore(objectStoreName, { keyPath: 'id' });
      }
    };
  });
}

export async function addDataToIndexedDB<T>(
  dbName: string,
  objectStoreName: string,
  version: number,
  data: T
): Promise<boolean> {
  const db = await openIndexedDB(dbName, objectStoreName, version);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const objectStore = transaction.objectStore(objectStoreName);
    const request = objectStore.put(data);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(new Error('idb error'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function editDataFromIndexedDB<T extends { id: string }>(
  dbName: string,
  objectStoreName: string,
  version: number,
  data: T
): Promise<boolean> {
  const db = await openIndexedDB(dbName, objectStoreName, version);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const objectStore = transaction.objectStore(objectStoreName);

    const getRequest = objectStore.get(data.id);

    getRequest.onsuccess = () => {
      const oldData = getRequest.result as T;
      const newData = { ...oldData, ...data };
      const updateRequest = objectStore.put(newData);

      updateRequest.onsuccess = () => {
        resolve(true);
      };

      updateRequest.onerror = () => {
        reject(new Error('idb error'));
      };
    };

    getRequest.onerror = () => {
      reject(new Error('idb error'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function getAllDataFromIndexedDB<T>(
  dbName: string,
  objectStoreName: string,
  version: number
): Promise<T[]> {
  const db = await openIndexedDB(dbName, objectStoreName, version);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readonly');
    const objectStore = transaction.objectStore(objectStoreName);

    const request = objectStore.getAll();

    request.onsuccess = () => {
      const data: T[] = request.result;
      resolve(data);
    };

    request.onerror = () => {
      reject(new Error('idb error'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
