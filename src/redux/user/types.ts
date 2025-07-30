export interface User {
  id: number;
  name: string;
  role: "Admin" | "Employee";
  businessId?: string; // Add business ID for multi-business support
}

export interface UserLoginRequest {
  id: number;
  pass: string;
  businessId?: string; // Add business ID to login request
}

export interface UserLoginResponse {
  status: string;
  message?: string;
  data?: User;
}

export interface UserSliceState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export enum AuthStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
