export interface DoctorData {
    _id: string;
    username: string;
    email: string;
    password: string;
    specializationIds: string[];
    qualificationIds: string[];
    experienceYears: number;
    bio: string;
    availability: string[];
    role: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface DoctorData {
    patientId: number;
    results: DoctorData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
