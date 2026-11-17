export interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  active: boolean;
  role: string;
}

export interface UserWritePayload {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  active: boolean;
}

export interface UserUpdatePayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  active?: boolean;
}
