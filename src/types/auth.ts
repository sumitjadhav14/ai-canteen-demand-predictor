export type UserRole = 'Canteen Supervisor' | 'Kitchen Manager' | 'Staff Member' | 'College Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

export type AuthMode = 'login' | 'signup' | 'forgot_password';
