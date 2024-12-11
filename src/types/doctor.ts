    export interface DoctorData {
        data: any;
        experience: string;
        gender: string;
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

export interface Doctor {
    results: DoctorData[];
    total: number;
    pages: number;
}
