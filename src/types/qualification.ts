export interface QualificationData {
  _id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Qualification {
  statusCode: number;
  message: string;
  data: {
    results: QualificationData[];
    count: number;
    pages: number;
  };
  errorMessage?: string;
}
