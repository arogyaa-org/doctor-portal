import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Symptoms, SymptomData } from '@/types/symptoms';

interface SymptomInitialState {
    symptom: SymptomData | null;
    reduxLoading: boolean;
}

const initialState: SymptomInitialState = {
    symptom: null,
    reduxLoading: false,
};

export const symptomSlice = createSlice({
    name: 'symptom',
    initialState,
    reducers: {
        setSymptom: (state, action: PayloadAction<SymptomData>) => { 
            state.symptom = action.payload; 
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setSymptom, setLoading } = symptomSlice.actions;
export default symptomSlice.reducer;
