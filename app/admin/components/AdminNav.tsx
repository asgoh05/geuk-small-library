"use client";
import Link from "next/link";
import AdminPassword from "./AdminPassword";
import { useState, useCallback } from "react";

export default function AdminNav() {
  const [verified, setVerified] = useState(false);
  const callbackRef = useCallback((inputElement: HTMLElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
  return (
    <div>
      {verified ? (
        <div className="flex gap-4 justify-center">
          <Link
            className="rounded-full text-sm px-2 py-1 border hover:opacity-50"
            href="/admin"
          >
            Admin Home
          </Link>
          <Link
            className="rounded-full text-sm px-2 py-1 border hover:opacity-50"
            href="/admin/addbook"
          >
            도서 추가
          </Link>
          <Link
            className="rounded-full text-sm px-2 py-1 border hover:opacity-50"
            href="/admin/addbookExcel"
          >
            도서 추가 (Excel)
          </Link>
          <Link
            className="rounded-full text-sm px-2 py-1 bg-red-200 hover:opacity-50"
            href="/"
          >
            Close
          </Link>
        </div>
      ) : (
        <AdminPassword onVerified={() => setVerified(true)} />
      )}
    </div>
  );
}
