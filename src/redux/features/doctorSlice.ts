import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Doctor } from '@/types/doctor';

interface DoctorInitialState {
    doctor: Doctor | null; 
    reduxLoading: boolean;
}

const initialState: DoctorInitialState = {
    doctor: null,
    reduxLoading: false
};

export const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        setDoctor: (state, action: PayloadAction<Doctor>) => {
            state.doctor = action.payload; // Store the complete doctor object
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setDoctor, setLoading } = doctorSlice.actions;
export default doctorSlice.reducer;
