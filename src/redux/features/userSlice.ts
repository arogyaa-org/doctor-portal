import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@/types/user';

interface UserInitialState {
    user: User | null;
    reduxLoading: boolean;
}

const initialState: UserInitialState = {
    user: null,
    reduxLoading: false
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload; // Store the complete user object
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
