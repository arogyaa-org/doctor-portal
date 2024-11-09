export interface PatientData {
    _id: string;
    username: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    city: string;
    medical_history: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Patient {
    patientId: number;
    results: PatientData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
