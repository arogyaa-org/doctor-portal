export interface SymptomData {
    _id: string;
    name: string;
    description: string;
    path: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Symptoms {
    results: SymptomData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
