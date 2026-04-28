import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // Optional so the auth callbacks can return an empty token to invalidate
    // the session when the underlying user record disappears.
    id?: string;
    role?: string;
  }
}
