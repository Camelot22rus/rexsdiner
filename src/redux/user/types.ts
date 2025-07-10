export interface User {
  id: number;
  name: string;
  role: "Admin" | "Employee";
}

export interface UserLoginRequest {
  id: number;
  pass: string;
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
