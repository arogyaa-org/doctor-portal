import { configureStore } from '@reduxjs/toolkit';

import appointmentReducer from './features/appointmentSlice';
import patientReducer from './features/patientSlice';
import toastReducer from "./features/toastSlice";

export const store = configureStore({
  reducer: {
    appointment: appointmentReducer,
    patient: patientReducer,
    toast: toastReducer,
  },
});

export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
