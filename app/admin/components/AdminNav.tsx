"use client";
import Link from "next/link";
import AdminPassword from "./AdminPassword";
import { useState } from "react";

export default function AdminNav() {
  const [verified, setVerified] = useState(false);
  return (
    <div>
      {verified ? (
        <div className="flex gap-4 justify-center">
          <Link className="rounded-full px-2 py-1 border" href="/admin">
            Admin Home
          </Link>
          <Link className="rounded-full px-2 py-1 border" href="/admin/addbook">
            도서 추가
          </Link>
          <Link className="rounded-full px-2 py-1 border" href="/">
            Exit Admin Page
          </Link>
        </div>
      ) : (
        <AdminPassword onVerified={() => setVerified(true)} />
      )}
    </div>
  );
}
