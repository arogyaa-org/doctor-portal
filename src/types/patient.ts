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
    results: PatientData[];
    total: number;
    pages: number;
}
