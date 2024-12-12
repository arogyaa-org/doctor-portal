export interface AppointmentData {
    _id: string;
    patientId: string;
    doctorId: string;
    appointmentTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Appointment {
    results: AppointmentData[];
    count: number;
    pages: number;
    errorMessage?: string | null;
}