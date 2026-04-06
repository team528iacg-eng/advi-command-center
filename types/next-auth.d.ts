import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; name: string; email: string; role: UserRole;
      initials: string; avatarBg: string; avatarColor: string;
    };
  }
  interface User {
    id: string; name: string; email: string; role: UserRole;
    initials: string; avatarBg: string; avatarColor: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string; role: UserRole; initials: string; avatarBg: string; avatarColor: string;
  }
}

export type UserRole = 'admin' | 'director' | 'producer' | 'sound_designer' | 'member';
