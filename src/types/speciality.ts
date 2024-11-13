export interface SpecialityData {
    _id: string;
    name: string;
    description: string;
    imgUrl: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Speciality {
    patientId: number;
    results: SpecialityData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
