"use client";

import { IBook } from "@/app/(models)/Book";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BookDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [book, setBook] = useState<IBook>();
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();

  async function handleReturn() {
    if (!session) {
      window.alert("로그인 후 이용해주세요");
      return;
    }
    const res = await fetch(`/api/books/return/${book?.manage_id}`, {
      method: "PUT",
      body: JSON.stringify({
        return_date: Date.now(),
        user_name: session.user?.name,
        user_email: session.user?.email,
      }),
    });
    setLoading(true);
  }

  async function handleRent() {
    if (!session) {
      window.alert("로그인 후 이용해주세요");
      return;
    }
    const res = await fetch(`/api/books/rent/${book?.manage_id}`, {
      method: "PUT",
      body: JSON.stringify({
        rent_date: Date.now(),
        user_name: session.user?.name,
        user_email: session.user?.email,
      }),
    });
    setLoading(true);
  }

  useEffect(() => {
    fetch(`/api/books/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setLoading(false);
      });
  }, [params.id, isLoading]);
  return (
    <div className="flex justify-center items-center h-screen">
      <Link
        href="/"
        className="absolute top-10 left-10 rounded-full bg-slate-300 p-4 hover:bg-slate-600 hover:text-white cursor-pointer"
      >
        Home
      </Link>
      {isLoading ? (
        <p>loading...</p>
      ) : (
        <div className="flex">
          <div className="flex flex-col p-24 items-center h-screen justify-center">
            <div className="flex gap-3 p-4 w-full">
              <p>도서 번호:</p>
              <input type="text" value={book?.manage_id} />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>제목:</p>
              <input type="text" value={book?.title} />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>저자:</p>
              <input type="text" value={book?.author} />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>등록 날짜:</p>
              <input type="text" value={toDateOnly(book?.reg_date)} />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>추가 정보:</p>
              <input type="text" value={book?.comments} />
            </div>
          </div>
          <div className="flex flex-col p-24 items-center h-screen justify-center">
            <div className="p-4 w-full">
              {book?.rental_info.rent_available ? (
                <p className="text-green-600">대여 가능</p>
              ) : (
                <p className="text-red-600">현재 이용중인 회원이 있어요</p>
              )}
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>대여일: </p>
              <input
                type="text"
                value={toDateOnly(book?.rental_info.rent_date)}
              />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>반납일: </p>
              <input
                type="text"
                value={toDateOnly(book?.rental_info.return_date)}
              />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>사용중인 회원: </p>
              <input type="text" value={book?.rental_info.user_name} />
            </div>
            <div className="flex gap-3 p-4 w-full">
              <p>직원 이메일: </p>
              <input type="email" value={book?.rental_info.user_email} />
            </div>
            <div className="flex gap-3 p-4 w-full">
              {session &&
              !book?.rental_info.rent_available &&
              session.user?.email === book?.rental_info.user_email ? (
                <button onClick={handleReturn}>반납하기</button>
              ) : (
                ""
              )}
              {session && book?.rental_info.rent_available ? (
                <button onClick={handleRent}>대여하기</button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toDateOnly(date?: Date) {
  if (!date) return "";
  return date.toString().split("T")[0];
}
