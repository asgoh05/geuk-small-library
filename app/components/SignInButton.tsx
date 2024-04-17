"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <button
        className="border w-24 text-xs p-2 rounded-lg hover:bg-neutral-50"
        onClick={() => signOut()}
      >
        Log Out
      </button>
    );
  }
  return (
    <button
      className="border w-full p-2 rounded-lg hover:bg-neutral-50"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      Google 계정으로 로그인
    </button>
  );
}
