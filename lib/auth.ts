import { USERS, User } from './data';

export function authenticate(email: string, password: string): User | null {
  return USERS.find(u => u.email === email && u.password === password) ?? null;
}

export function getUserById(id: string): User | null {
  return USERS.find(u => u.id === id) ?? null;
}
