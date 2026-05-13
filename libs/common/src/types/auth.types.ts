export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface UserInfo {
  id: string;
  email: string;
  createdAt: Date;
}
