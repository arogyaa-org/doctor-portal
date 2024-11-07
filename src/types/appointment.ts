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
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}