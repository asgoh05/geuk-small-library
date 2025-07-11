"use client";

import { IBook } from "@/app/(models)/Book";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SignInButton from "@/app/components/SignInButton";

export default function BookDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [book, setBook] = useState<IBook>();
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch(`/api/books/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setLoading(false);
      });
  }, [params.id, isLoading]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pb-4 px-4">
      <div className="fixed z-10 bg-white border py-2">
        <div className="flex w-screen px-8 justify-between items-center">
          <Link href="/" className="w-full text-xs">
            <p className="w-full text-xs">
              {session?.user?.real_name}님, 환영합니다
            </p>
          </Link>
          <SignInButton />
        </div>
      </div>
      <div>
        <div className="flex flex-col w-screen gap-4 h-screen pt-14 pb-14 border justify-center items-center">
          <div className="flex flex-row gap-2 items-end">
            <p className="text-xs">도서 번호:</p>
            <p className="text-md">{book?.manage_id}</p>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <p className="text-xs">책 이름:</p>
            <p className="text-md">{book?.title}</p>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <p className="text-xs">저자 :</p>
            <p className="text-md">{book?.author}</p>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <p className="text-xs">등록일 :</p>
            <p className="text-md">
              {book?.reg_date.toString().substring(0, 10)}
            </p>
          </div>
          <div className="absolute">
            {book?.rental_info.rent_available ? (
              <p className="text-xs bg-green-300 p-1 rounded-full">대여 가능</p>
            ) : (
              <p className="text-xs bg-red-300 p-1 rounded-full">대여 불가</p>
            )}
          </div>
          <div className="gap-2 items-end border mt-10 py-10 px-20 rounded-lg">
            <p className="text-xs text-center pb-4">최근 사용자</p>
            <p className="text-md text-center">
              <i>{book?.rental_info.user_name}</i>
            </p>
            <p className="text-xs text-center text-neutral-500">
              <i>{book?.rental_info.user_email}</i>
            </p>
            <div className="flex flex-row gap-2 items-end pt-4">
              <p className="text-xs">대여한 날짜 :</p>
              <p className="text-xs">
                {book?.rental_info.rent_date?.toString().substring(0, 10)}
              </p>
            </div>
            <div className="flex flex-row gap-2 items-end">
              <p className="text-xs">반납한 날짜 :</p>
              <p className="text-xs">
                {book?.rental_info.return_date
                  ? book?.rental_info.return_date.toString().substring(0, 10)
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-2">
        <p className="text-center text-xs pt-6 text-neutral-400">
          &copy; Ultrasound Korea, GE Healthcare
        </p>
      </div>
    </main>
  );
}

function toDateOnly(date?: Date) {
  if (!date) return "";
  return date.toString().split("T")[0];
}
