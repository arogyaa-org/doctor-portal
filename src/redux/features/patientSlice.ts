import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Patient } from '@/types/patient';

interface PatientInitialState {
    patient: Patient | null; 
    reduxLoading: boolean;
};

const initialState: PatientInitialState = {
    patient: null,
    reduxLoading: false
};

export const patientSlice = createSlice({
    name: 'patient',
    initialState,
    reducers: {
        setPatient: (state, action: PayloadAction<Patient>) => {
            state.patient = action.payload; // Store the complete patient object
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setPatient, setLoading } = patientSlice.actions;
export default patientSlice.reducer;
