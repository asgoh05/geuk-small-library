"use client";
import { BaseSyntheticEvent, useState, useCallback } from "react";
import { IoReturnDownBackOutline } from "react-icons/io5";

interface AdminPasswordProps {
  onVerified: () => void;
}

export default function AdminPassword({ onVerified }: AdminPasswordProps) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const callbackRef = useCallback((inputElement: HTMLInputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const changePassword = (e: BaseSyntheticEvent) => {
    setPassword(e.target.value);
  };
  const verifyPassword = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_APP_ADM_PASSWORD) {
      onVerified();
    } else {
      setMessage("wrong password");
      setPassword("");
      setTimeout(() => setMessage(""), 3 * 1000);
    }
  };
  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl flex flex-col justify-center items-center z-10">
      <form onSubmit={verifyPassword}>
        <div className="pb-2">
          <p>Admin Password:</p>
        </div>
        <div className="flex gap-4">
          <input
            className="rounded-full px-2 py-1 border"
            type="password"
            onChange={changePassword}
            value={password}
            ref={callbackRef}
          />
          <button type="submit" className="relative right-10 font-bold">
            <IoReturnDownBackOutline />
          </button>
        </div>
      </form>
      <div>
        <p className="text-xs text-red-500 relative right-4">{message}</p>
      </div>
    </div>
  );
}
