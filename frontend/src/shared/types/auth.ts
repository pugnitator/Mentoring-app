export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: 'MENTOR' | 'MENTEE';
}

export interface LoginData {
  email: string;
  password: string;
}
