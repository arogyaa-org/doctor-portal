import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Appointment } from '@/types/appointment';

interface appointmentInitialState {
    appointment: Appointment | null;    // Stores the entire Appointment object
    reduxLoading: boolean;
};

const initialState: appointmentInitialState = {
    appointment: null,
    reduxLoading: false
};

export const appointmentSlice = createSlice({
    name: 'appointment',
    initialState,
    reducers: {
        setAppointment: (state, action: PayloadAction<Appointment>) => {
            state.appointment = action.payload;     // Store the complete object
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setAppointment, setLoading } = appointmentSlice.actions;
export default appointmentSlice.reducer;
