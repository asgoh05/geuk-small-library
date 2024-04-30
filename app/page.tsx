"use client";
import MainPage from "./components/MainPage";
import { useSession } from "next-auth/react";
import SignInButton from "@/app/components/SignInButton";

export default function Home() {
  // const books: IBook[] = await fetchBooks();
  const { data: session } = useSession();
  return (
    <div className="w-full bg-[url('/Lot-of-books-in-library_1920x1080.jpg')]">
      {session && session.user ? (
        // 로그인 되었을 때
        <MainPage />
      ) : (
        // 로그인 되지 않았을 때
        <main className="flex min-h-screen flex-col items-center justify-between p-8">
          <div>
            <p className="text-xs text-white pt-10">
              GEUK 도서관에 오신 것을 환영합니다
            </p>
          </div>
          <div className="">
            <p className="text-center p-4 pb-2 text-3xl text-white">
              Welcom to
            </p>
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
