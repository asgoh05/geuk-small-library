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
          console.log(`=== 세션 콜백 시작: ${session.user.email} ===`);
          console.log("환경:", process.env.NODE_ENV);
          console.log("MongoDB URI 존재:", !!process.env.MONGODB_URI);

          // 등록된 사용자인지 확인
          const dbUser = await LibraryUser.findOne({
            email: session.user.email,
          });

          if (dbUser) {
            console.log(`등록된 사용자 발견: ${dbUser.real_name}`);
            console.log("사용자 상세 정보:", {
              email: dbUser.email,
              real_name: dbUser.real_name,
              company_email: dbUser.company_email,
              banned: dbUser.banned,
              admin: dbUser.admin,
              registered_at: dbUser.registered_at,
            });

            // 등록된 사용자인 경우 실명과 탈퇴/관리자 상태 추가
            session.user.real_name = dbUser.real_name;
            session.user.company_email = dbUser.company_email; // company_email 추가
            session.user.banned = dbUser.banned;
            // admin 필드가 없는 기존 사용자의 경우 기본값 false 처리
            session.user.admin = dbUser.admin ?? false;
            session.user.registered = true;

            console.log("세션에 설정된 값들:", {
              registered: session.user.registered,
              banned: session.user.banned,
              admin: session.user.admin,
              real_name: session.user.real_name,
            });
          } else {
            console.log(`등록되지 않은 사용자: ${session.user.email}`);
            // 등록되지 않은 사용자
            session.user.registered = false;
            session.user.banned = false;
            session.user.admin = false;
          }

          console.log(
            `세션 상태: registered=${session.user.registered}, banned=${session.user.banned}, admin=${session.user.admin}`
          );
          console.log("=== 세션 콜백 완료 ===");
        } catch (error) {
          console.error("=== 세션 콜백 에러 ===", error);
          console.error("에러 타입:", (error as any)?.constructor?.name);
          console.error("에러 메시지:", (error as Error)?.message);
          console.error("스택:", (error as Error)?.stack);
          console.error("DB 연결 상태 확인 필요");
          session.user.registered = false;
          session.user.banned = false;
          session.user.admin = false;
        }
      } else {
        console.log("세션에 이메일이 없음:", session);
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // 로그인 페이지는 메인 페이지
  },
  // 디버깅을 위한 추가 설정
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
});

export { handler as GET, handler as POST };
