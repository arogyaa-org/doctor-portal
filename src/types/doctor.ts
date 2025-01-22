export interface DoctorData {
    _id: string | number;
    username: string;
    email: string;
    password: string;
    contact: string;
    experience: string | number;
    bio: string;
    tags: string[];
    gender: string | null;
    dob: string;
    languageSpoken: string[];
    address: string;
    pincode: string | number;
    profilePicture: { file: File; preview: string } | null;
    consultationFee: string | number;
    status: string | null;
    role: string | null;
    specializationIds: string[];
    symptomIds: string[];
    qualificationIds: string[];
    availability: { day: string; startTime: string; endTime: string }[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Doctor {
    statusCode: number;
    message: string;
    data: {
        results: DoctorData[];
        count: number;
        pages: number;
    };
    errorMessage?: string;
}
