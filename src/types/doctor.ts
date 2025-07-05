export interface DoctorData {
    _id?: string | number;
    username: string;
    email: string;
    password: string;
    contact: string;
    experience: string | number;
    bio: string;
    tags: string[];
    gender: string | null;
    dob: string;
    languagesSpoken: string[];
    clinicAddress: string;
    pincode: string | number;
    profilePicture: { file: File; preview: string } | null;
    consultationFee: string | number;
    status: string | null;
    specializationIds: any[];
    symptomIds: any[];
    qualificationIds: any[];
    availability: {
        hospital: {
            name: string;
            location: string;
        };
        day: string;
        startTime: string;
        endTime: string;
    }[];
    isVerified: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
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
