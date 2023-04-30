import { syncedStore, getYjsValue } from '@syncedstore/core';
// import { WebrtcProvider } from 'y-webrtc';
import { AbstractType } from 'yjs';
import { Essence } from '../../libs/ecs/essence';
import { BgsWorldComponents } from '../../libs/bgs/ecs';

// Create your SyncedStore store
export const store = syncedStore<Essence<BgsWorldComponents>>({ pools: {} });
// @ts-ignore
window.bgsStore = store;

export const initStore = (roomId: string) => {
  // Get the Yjs document and sync automatically using y-webrtc
  const doc = getYjsValue(store);
  if (!doc) {
    throw new Error(`No doc`);
  }
  if (doc instanceof AbstractType) {
    throw new Error(`Must be doc`);
  }
  // const webrtcProvider = new WebrtcProvider(roomId, doc);
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
