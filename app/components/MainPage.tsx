"use client";
import SignInButton from "@/app/components/SignInButton";
import { useSession } from "next-auth/react";
import BookList from "./BookList";

export default function MainPage() {
  const { data: session } = useSession();

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between pb-4 px-4">
        <div className="fixed z-10 bg-white border py-2">
          <div className="flex w-screen px-8 justify-between items-center">
            <p className="w-full text-xs">
              {session?.user?.name}님, 환영합니다
            </p>
            <SignInButton />
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
