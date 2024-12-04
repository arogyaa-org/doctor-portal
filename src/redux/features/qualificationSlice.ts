import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Qualification } from '@/types/qualification';

interface QualificationInitialState {
  qualification: Qualification | null; 
  reduxLoading: boolean; 
}

const initialState: QualificationInitialState = {
  qualification: null,
  reduxLoading: false,
};

export const qualificationSlice = createSlice({
  name: 'qualification',
  initialState,
  reducers: {
    setQualification: (state, action: PayloadAction<Qualification>) => {
      state.qualification = action.payload;
      state.reduxLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    
    },
  },
});

export const {
  setQualification,
  setLoading,
} = qualificationSlice.actions;
export default qualificationSlice.reducer;
