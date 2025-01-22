export interface SpecialityData {
    _id: string;
    name: string;
    description: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Speciality {
    statusCode: number;
    message: string;
    data: {
        results: SpecialityData[];
        count: number;
        pages: number;
    };
    errorMessage?: string;
}
