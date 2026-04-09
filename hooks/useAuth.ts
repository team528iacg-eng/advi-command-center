'use client';
import { useStore } from '@/lib/store';
import { USERS } from '@/lib/data';

export function useAuth() {
  const { user, login, logout } = useStore();
  return {
    user,
    login,
    logout,
    getCurrentUser: () => user,
    isAdmin: user?.isAdmin ?? false,
  };
}

// Mock Google SSO — simulates OAuth by logging in as the admin user
export function mockGoogleLogin() {
  return USERS.find(u => u.isAdmin) ?? USERS[0];
}
