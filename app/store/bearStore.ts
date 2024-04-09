import { create } from 'zustand';

import {
  addDataToIndexedDB,
  editDataFromIndexedDB,
  getAllDataFromIndexedDB,
} from '@/app/lib/idb';

export type Bear = {
  id: string;
  name: string;
  weight: number;
};

type BearState = {
  bear: { [key: string]: Bear };
  addBear: (items: { [key: string]: Bear }) => void;
};

export const useBearStore = create<BearState>()((set) => ({
  bear: {},
  addBear: (items) => set((state) => ({ bear: { ...state.bear, ...items } })),
}));

const DB_NAME = 'bear-db';
const OBJECT_STORE_NAME = 'bear-store';
const VERSION = 1;

// Hydration
async function hydrate() {
  if (!globalThis.indexedDB) return;

  const indexedDBData = await getAllDataFromIndexedDB<Bear>(
    DB_NAME,
    OBJECT_STORE_NAME,
    VERSION
  );

  const zustandState = indexedDBData.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [key: string]: Bear });

  useBearStore.setState((state) => ({
    bear: { ...state.bear, ...zustandState },
  }));
}

hydrate();

// This callback function runs every time you store data.
useBearStore.subscribe(async (state, prevState) => {
  const stateKeys = Object.keys(state.bear);
  const prevStateKeys = Object.keys(prevState.bear);

  // Do not run for hydration.
  if (prevStateKeys.length === 0) return;

  // Find newly added or changed items.
  for (let i = 0; i < stateKeys.length; ++i) {
    const key = stateKeys[i];
    const value = state.bear[key];
    // New item
    if (!prevStateKeys.includes(key)) {
      await addDataToIndexedDB<Bear>(
        DB_NAME,
        OBJECT_STORE_NAME,
        VERSION,
        value
      );
      break;
    }
    // Changed item
    const prevValue = prevState.bear[key];
    if (JSON.stringify(value) !== JSON.stringify(prevValue)) {
      await editDataFromIndexedDB<Bear>(
        DB_NAME,
        OBJECT_STORE_NAME,
        VERSION,
        value
      );
      break;
    }
  }
});
