"use client";
import MainPage from "./components/MainPage";
import { useSession } from "next-auth/react";
import SignInButton from "@/app/components/SignInButton";

export default function Home() {
  // const books: IBook[] = await fetchBooks();
  const { data: session } = useSession();
  return (
    <div>
      {session && session.user ? (
        // 로그인 되었을 때
        <MainPage />
      ) : (
        // 로그인 되지 않았을 때
        <main className="flex min-h-screen flex-col items-center justify-between p-8">
          <div>
            <p className="text-xs">GEUK 도서관에 오신 것을 환영합니다</p>
          </div>
          <div className="">
            <p className="text-center p-4 text-2xl">GEUK Library</p>
            <SignInButton />
          </div>
          <div className="fixed bottom-2 pt-16 text-neutral-400">
            <p className="text-center text-xs">
              &copy; Ultrasound Korea, GE Healthcare
            </p>
          </div>
        </main>
      )}
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
