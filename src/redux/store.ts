import { configureStore } from '@reduxjs/toolkit';

import appointmentReducer from './features/appointmentSlice';

export const store = configureStore({
  reducer: {
    appointment:appointmentReducer
  },
});

export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
