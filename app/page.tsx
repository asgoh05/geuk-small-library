"use client";
import MainPage from "./components/MainPage";
import { useSession } from "next-auth/react";
import SignInButton from "@/app/components/SignInButton";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleRegisterClick = () => {
    console.log("회원가입 버튼 클릭됨");
    console.log("현재 세션 상태:", {
      email: session?.user?.email,
      registered: session?.user?.registered,
    });
    router.push("/register");
  };

  // 로딩 중
  if (status === "loading") {
    return (
      <div className="w-full min-h-screen bg-[url('/library_downloaded2.png')] bg-cover">
        <LoadingSpinner
          message="세션을 확인하는 중..."
          size="large"
          fullScreen={true}
          backdrop={true}
        />
      </div>
    );
  }

  // 로그인된 사용자 처리
  if (session && session.user) {
    // 강제 탈퇴된 사용자
    if (session.user.banned === true) {
      return (
        <div className="w-full min-h-screen bg-[url('/library_downloaded2.png')] bg-cover flex items-center justify-center">
          <div className="bg-white bg-opacity-95 rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">이용 제한</h2>
            <p className="text-gray-600 mb-4">
              안녕하세요, <strong>{session.user.real_name}</strong>님
            </p>
            <p className="text-gray-600 mb-6">
              현재 도서관 이용이 제한된 상태입니다.
              <br />
              문의사항이 있으시면 관리자에게 연락해주세요.
            </p>
            <SignInButton />
          </div>
        </div>
      );
    }

    // 등록되지 않은 사용자
    if (session.user.registered === false) {
      return (
        <div className="w-full min-h-screen bg-[url('/library_downloaded2.png')] bg-cover flex items-center justify-center">
          <div className="bg-white bg-opacity-95 rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              회원가입이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              GEUK 도서관을 이용하려면 먼저 회원가입을 완료해주세요.
            </p>
            <button
              onClick={handleRegisterClick}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center transition-colors duration-200"
            >
              회원가입하기
            </button>
          </div>
        </div>
      );
    }

    // 등록된 정상 사용자 - 메인 페이지 표시
    if (session.user.registered === true && session.user.banned === false) {
      return (
        <div className="w-full bg-[url('/library_downloaded2.png')] bg-cover">
          <MainPage />
        </div>
      );
    }
  }

  // 로그인되지 않은 사용자
  return (
    <div className="w-full bg-[url('/library_downloaded2.png')] bg-cover">
      <main className="flex min-h-screen flex-col items-center justify-between p-8">
        <div>
          <p className="text-xs text-white pt-10">
            GEUK 도서관에 오신 것을 환영합니다
          </p>
        </div>
        <div className="">
          <p className="text-center p-4 pb-2 text-3xl text-white">Welcome to</p>
          <p className="text-center p-4 pt-2 pb-8 text-3xl text-white">
            GEUK Library
          </p>
          <div>
            <SignInButton />
          </div>
        </div>
        <div className="pt-16 text-white">
          <p className="text-center text-xs pb-10">
            &copy; Ultrasound Korea, GE Healthcare
          </p>
        </div>
      </main>
    </div>
  );
}

// async function fetchBooks() {
//   const res = await fetch(`${process.env.HOME_URL}/api/books`, {
//     cache: "no-store",
//   });

//   const books = await res.json();
//   return books;
// }
