"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return <button onClick={() => signOut()}>로그아웃</button>;
  }
  return <button onClick={() => signIn()}>로그인</button>;
}