import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { gameMapEntitySlice } from './game-map-entity';
import { fighterEntitySlice } from './fighter-entity';

export const rootReducer = combineReducers({
  gameMapEntity: gameMapEntitySlice.reducer,
  fighterEntity: fighterEntitySlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
