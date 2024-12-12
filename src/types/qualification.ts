export interface QualificationData {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Qualification {
  results: QualificationData[];
  count: number;
  pages: number;
  errorMessage?: string | null;
}
