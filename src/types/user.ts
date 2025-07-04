export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum Role {
  ADMIN = "admin",
  SUB_ADMIN = "sub_admin",
  SALES = 'sales'
}

export interface UserData {
  _id?: string;
  username: string;
  email: string;
  password: string;
  contact: string;
  designation: string;
  gender: Gender | null;
  dob: string;
  address: string;
  pincode: number | null;
  profilePicture: string;
  status: Status;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface User {
  statusCode: number;
  message: string;
  data: {
    results: UserData[];
    count: number;
    pages: number;
  };
  errorMessage?: string;
}
