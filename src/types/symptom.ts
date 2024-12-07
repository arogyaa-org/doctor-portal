export interface SymptomData {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Symptom {
    results: SymptomData[];
    total: number;
    pages: number;
}
