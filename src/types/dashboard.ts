

export type Trend = "up" | "down" | "same";

export interface DashboardStatData {
  title: string;
  value: number;
  diff: number;
  trend: Trend;
  iconColor: string;
}

export interface PatientData {
  _id: string;
  username: string;
  email: string;
}

export interface DoctorData {
  _id: string;
  username: string;
}

export interface AppointmentData {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: "approved" | "pending" | "completed" | "rejected";
  updatedAt: string;
  patientData: PatientData[];
  doctorData: DoctorData[];
  patientId?: string;
  doctorId?: string;
}

export interface MonthlyChartData {
  name: "This year" | "Last year";
  data: number[];
}

export interface Dashboard<
  T = DashboardStatData[] | AppointmentData[] | MonthlyChartData[],
> {
  statusCode: number;
  message: string;
  data: {
    results: T;
    count: number;
    pages: number;
  };
  errorMessage?: string;
}

export type DashboardModifyData = Partial<AppointmentData>;
