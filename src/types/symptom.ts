export interface SymptomData {
    _id: string;
    name: string;
    description: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Symptom {
    statusCode: number;
    message: string;
    data: {
        results: SymptomData[];
        count: number;
        pages: number;
    };
    errorMessage?: string;
}
