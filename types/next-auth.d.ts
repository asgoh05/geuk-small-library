import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      real_name?: string;
      registered?: boolean;
      banned?: boolean;
      admin?: boolean;
    };
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    real_name?: string;
    registered?: boolean;
    banned?: boolean;
    admin?: boolean;
  }
}
