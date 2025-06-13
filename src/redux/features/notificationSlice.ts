import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Notifications } from '@/types/notifications';

interface notificationsInitialState {
    notifications: Notifications[];
    reduxLoading: boolean;
};

const initialState: notificationsInitialState = {
    notifications: [],
    reduxLoading: false
};

export const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notifications[]>) => {
            state.notifications = action.payload;
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setNotifications, setLoading } = notificationsSlice.actions;

// Export the reducer to be used in the store configuration
export default notificationsSlice.reducer;
