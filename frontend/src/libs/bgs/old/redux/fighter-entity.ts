import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { FighterEntity } from '../entities/figter';

export const fighterEntityAdapter = createEntityAdapter<FighterEntity>({
  selectId: (message) => message.id,
});

export const fighterEntitySlice = createSlice({
  name: 'fighterEntity',
  initialState: fighterEntityAdapter.getInitialState(),
  reducers: {
    addOne: fighterEntityAdapter.addOne,
    addMany: fighterEntityAdapter.addMany,
    setAll: fighterEntityAdapter.setAll,
    removeOne: fighterEntityAdapter.removeOne,
    removeMany: fighterEntityAdapter.removeMany,
    removeAll: fighterEntityAdapter.removeAll,
    updateOne: fighterEntityAdapter.updateOne,
    updateMany: fighterEntityAdapter.updateMany,
    upsertOne: fighterEntityAdapter.upsertOne,
    upsertMany: fighterEntityAdapter.upsertMany,
  },
});
