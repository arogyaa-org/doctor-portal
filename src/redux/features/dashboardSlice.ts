import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  Dashboard,
  DashboardStatData,
  AppointmentData,
  MonthlyChartData,
} from "@/types/dashboard";

interface DashboardInitialState {
  dashboard: Dashboard<
    DashboardStatData[] | AppointmentData[] | MonthlyChartData[]
  > | null;
  reduxLoading: boolean;
}

const initialState: DashboardInitialState = {
  dashboard: null,
  reduxLoading: false,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboard: (
      state,
      action: PayloadAction<
        Dashboard<DashboardStatData[] | AppointmentData[] | MonthlyChartData[]>
      >
    ) => {
      state.dashboard = action.payload;
      state.reduxLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

export const { setDashboard, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;
