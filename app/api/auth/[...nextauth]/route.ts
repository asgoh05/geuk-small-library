import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LibraryUser, { IUser } from "@/app/(models)/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google 로그인 성공 시 항상 허용
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          // 등록된 사용자인지 확인
          const dbUser = await LibraryUser.findOne({
            email: session.user.email,
          });

          if (dbUser) {
            // 등록된 사용자인 경우 실명과 탈퇴/관리자 상태 추가
            session.user.real_name = dbUser.real_name;
            session.user.banned = dbUser.banned;
            // admin 필드가 없는 기존 사용자의 경우 기본값 false 처리
            session.user.admin = dbUser.admin ?? false;
            session.user.registered = true;
          } else {
            // 등록되지 않은 사용자
            session.user.registered = false;
            session.user.banned = false;
            session.user.admin = false;
          }
        } catch (error) {
          console.error("Session callback error:", error);
          session.user.registered = false;
          session.user.banned = false;
          session.user.admin = false;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // 로그인 페이지는 메인 페이지
  },
});

export { handler as GET, handler as POST };
