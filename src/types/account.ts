export type UserRole = 'student' | 'teacher' | 'admin' | 'user';

export interface MexoProfile {
  id: string;
  username: string;
  primary_address: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  recovery_email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  role: UserRole;
  roles?: UserRole[];
  status: 'active' | 'suspended' | 'inactive';
  xp?: number;
  streak?: number;
  level?: number;
  coins?: number;
  created_at: string;
  updated_at: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
