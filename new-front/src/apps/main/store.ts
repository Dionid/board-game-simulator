import { syncedStore, getYjsValue } from '@syncedstore/core';
import { WebrtcProvider } from 'y-webrtc';
import { AbstractType } from 'yjs';
import { EssenceEvents, EssencePools } from '../../libs/ecs/essence';

// Create your SyncedStore store
export const essencePoolsStore = syncedStore<EssencePools<any>>({ pools: {} });
export const essenceEventsStore = syncedStore<EssenceEvents<any>>({ events: {} });

export const essence = {
  pools: essencePoolsStore.pools,
  events: essenceEventsStore.events,
};

// @ts-ignore
window.bgsStore = essence;

export const initStore = (roomId: string) => {
  // Get the Yjs document and sync automatically using y-webrtc
  const doc = getYjsValue(essencePoolsStore);
  if (!doc) {
    throw new Error(`No doc`);
  }
  if (doc instanceof AbstractType) {
    throw new Error(`Must be doc`);
  }
  const webrtcProvider = new WebrtcProvider(roomId, doc);

  webrtcProvider.connect();
};

// // (optional, define types for TypeScript)
// type Vehicle = { color: string; brand: string };
//
// // Create your SyncedStore store
// export const store = syncedStore({ vehicles: [] as Vehicle[] });
//
// export const initStore = (roomId: string) => {
// // Get the Yjs document and sync automatically using y-webrtc
// 	const doc = getYjsValue(store);
// 	if (!doc) {
// 		throw new Error(`No doc`)
// 	}
// 	if (doc instanceof AbstractType) {
// 		throw new Error(`Must be doc`)
// 	}
// 	const webrtcProvider = new WebrtcProvider(roomId, doc);
// }
