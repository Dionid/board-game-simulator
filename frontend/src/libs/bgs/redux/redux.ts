import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { GameMapEntity } from '../core/entities/game-map';

export const gameMapEntityAdapter = createEntityAdapter<GameMapEntity>({
  // Assume IDs are stored in a field other than `message.id`
  selectId: (message) => message.id,
});

export const gameMapEntitySlice = createSlice({
  name: 'gameMapEntity',
  initialState: gameMapEntityAdapter.getInitialState(),
  reducers: {
    // Can pass adapter functions directly as case reducers.  Because we're passing this
    // as a value, `createSlice` will auto-generate the `messageAdded` action type / creator
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
