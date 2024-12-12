export interface DoctorData {
    _id: string;
    username: string;
    email: string;
    password: string;
    contact: string;
    experience: number;
    bio: string;
    gender: string;
    dob: string;
    languageSpoken: string[];
    address: string;
    profilePicture: string;
    consultationFee: number;
    status: string;
    role: string;
    specializationIds: string[];
    qualificationIds: string[];
    availability: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Doctor {
    results: DoctorData[];
    count: number;
    pages: number;
    errorMessage?: string | null;
}
