import { syncedStore, getYjsValue } from '@syncedstore/core';
import { WebrtcProvider } from 'y-webrtc';
import { AbstractType } from 'yjs';
// Create your SyncedStore store
export const essencePoolsStore = syncedStore({ pools: {} });
export const essenceEventsStore = syncedStore({
  events: {},
});
essenceEventsStore.events.active = {};
essenceEventsStore.events.pending = {};
export const essence = {
  pools: essencePoolsStore.pools,
  events: essenceEventsStore.events,
};
// @ts-ignore
window.bgsStore = essence;
export const initStore = (roomId) => {
  // Get the Yjs document and sync automatically using y-webrtc
  const doc = getYjsValue(essencePoolsStore);
  if (!doc) {
    throw new Error(`No doc`);
  }
  if (doc instanceof AbstractType) {
    throw new Error(`Must be doc`);
  }
  return new WebrtcProvider(roomId, doc);
  // console.log('webrtcProvider.connected', webrtcProvider.connected);
  // webrtcProvider.on('connect', () => {
  //   console.log('CONNECTED');
  // });
  // webrtcProvider.
  // setInterval(() => {
  //   console.log('webrtcProvider.connected', webrtcProvider.connected);
  // }, 3000);
  // webrtcProvider.connect();
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
