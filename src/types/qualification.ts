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
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }
  