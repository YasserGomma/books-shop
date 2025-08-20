export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordData {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}