"use client";
import SignInButton from "@/app/components/SignInButton";
import { useSession } from "next-auth/react";
import BookList from "./BookList";
import Link from "next/link";
import { FaBookBookmark } from "react-icons/fa6";

export default function MainPage() {
  const { data: session } = useSession();

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between pb-4 px-4">
        <div className="fixed z-10 bg-white border py-2">
          <div className="flex w-screen px-8 justify-between items-center">
            <p className="w-full text-xs flex gap-2 items-end">
              <FaBookBookmark className="text-xl" />
              {session?.user?.name}님, 환영합니다
            </p>
            <div className="flex justify-center items-center gap-8">
              <Link
                className="hidden lg:block text-xs w-16 rounded-lg border px-2 py-2 text-center"
                href={"/admin"}
              >
                관리자
              </Link>
              <SignInButton />
            </div>
          </div>
        </div>
        <div className="flex flex-col overflow-auto h-4/5 w-full pt-14">
          <BookList />
        </div>
        <div>
          <p className="text-center text-xs pt-6 text-neutral-400">
            &copy; Ultrasound Korea, GE Healthcare
          </p>
        </div>
      </main>
    </div>
  );
}
