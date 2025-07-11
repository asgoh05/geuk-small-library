"use client";
import Link from "next/link";
import AdminPasswordWrap from "./AdminPasswordWrap";
import { useState } from "react";

export default function AdminNav() {
  return (
    <div>
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
          className="rounded-full text-sm px-2 py-1 border hover:opacity-50"
          href="/admin/export"
        >
          Export to Excel
        </Link>
        <Link
          className="rounded-full text-sm px-2 py-1 border hover:opacity-50"
          href="/admin/init_rental"
        >
          대여정보 초기화
        </Link>
        <Link
          className="rounded-full text-sm px-2 py-1 border hover:opacity-50"
          href="/admin/users"
        >
          사용자 관리
        </Link>
        <Link
          className="rounded-full text-sm px-2 py-1 bg-red-200 hover:opacity-50"
          href="/"
        >
          Close
        </Link>
      </div>
    </div>
  );
}
