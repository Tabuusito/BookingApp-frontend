export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string; 
}
