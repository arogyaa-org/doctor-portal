export interface SpecialityData {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Speciality {
    results: SpecialityData[];
    total: number;
    pages: number;
}
