import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Appointment } from '@/types/appointment';

interface appointmentInitialState {
    appointment: Appointment[];
    reduxLoading: boolean;
};

const initialState: appointmentInitialState = {
    appointment: [],
    reduxLoading: false
};

export const appointmentSlice = createSlice({
    name: 'appointment',
    initialState,
    reducers: {
        setAppointment: (state, action: PayloadAction<Appointment[]>) => {
            state.appointment = action.payload;
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setAppointment, setLoading } = appointmentSlice.actions;

// Export the reducer to be used in the store configuration
export default appointmentSlice.reducer;
