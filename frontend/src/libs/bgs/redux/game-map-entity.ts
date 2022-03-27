import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { GameMapEntity } from '../core/entities/game-map';

// export const gameMapEntitySlice = createSlice<
//   EntityStorage<GameMapEntity>,
//   SliceCaseReducers<EntityStorage<GameMapEntity>>,
//   "gameMapEntity"
// >({
//   name: 'gameMapEntity',
//   initialState: {
//     byId: {},
//     allIds: [],
//   },
//   reducers: {
//     addEntity: (state, action: PayloadAction<{entity: GameMapEntity}>) => {
//       const {entity} = action.payload
//       state.byId[entity.id] = entity
//       state.allIds.push(entity.id)
//     }
//   },
// });

export const gameMapEntityAdapter = createEntityAdapter<GameMapEntity>({
  selectId: (message) => message.id,
});

export const gameMapEntitySlice = createSlice({
  name: 'gameMapEntity',
  initialState: gameMapEntityAdapter.getInitialState(),
  reducers: {
    addOne: gameMapEntityAdapter.addOne,
    addMany: gameMapEntityAdapter.addMany,
    setAll: gameMapEntityAdapter.setAll,
    removeOne: gameMapEntityAdapter.removeOne,
    removeMany: gameMapEntityAdapter.removeMany,
    removeAll: gameMapEntityAdapter.removeAll,
    updateOne: gameMapEntityAdapter.updateOne,
    updateMany: gameMapEntityAdapter.updateMany,
    upsertOne: gameMapEntityAdapter.upsertOne,
    upsertMany: gameMapEntityAdapter.upsertMany,
  },
});
