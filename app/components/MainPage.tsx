"use client";
import SignInButton from "./SignInButton";
import { IBook } from "../(models)/Book";
import { useSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroller";
import BookList from "./BookList";

interface MainPageProps {
  books: IBook[];
}

export default function MainPage({ books }: MainPageProps) {
  const { data: session } = useSession();
  return (
    <div>
      {session && session.user ? (
        // 로그인 되었을 때
        <main className="flex min-h-screen flex-col items-center justify-between pb-4 px-4">
          <div className="fixed z-10 bg-white border py-2">
            <div className="flex w-screen px-8 justify-between items-center">
              <p className="w-full text-xs">
                {session.user.name}님, 환영합니다
              </p>
              <SignInButton />
            </div>
          </div>
          <div className="flex flex-col overflow-auto h-4/5 w-full pt-14">
            <BookList books={books} />
          </div>
          <div>
            <p className="text-center text-xs pt-6 text-neutral-400">
              &copy; Ultrasound Korea, GE Healthcare
            </p>
          </div>
        </main>
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
          <div className="pt-16 text-neutral-400">
            <p className="text-center text-xs">
              &copy; Ultrasound Korea, GE Healthcare
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
