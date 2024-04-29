"use client";
import { getDateString } from "@/app/(general)/datetime";
import { IBookInternal } from "@/app/(models)/Book";
import BookIDInput from "@/app/components/BookIDInput";
import { BaseSyntheticEvent, useState } from "react";

export default function InitRentalInfoPage() {
  const [manageID, setManageID] = useState("");
  const [message, setMessage] = useState("");
  const [book, setBook] = useState<IBookInternal | null>(null);
  const searchBook = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (manageID === "") return;

    const res = await fetch(`/api/books/${manageID}`);
    const book = await res.json();
    setBook(book as IBookInternal);
  };

  const initRentalInfo = async () => {
    if (book === null) return;

    book.rental_info.rent_available = true;
    book.rental_info.expected_return_date = null;
    book.rental_info.rent_date = null;
    book.rental_info.return_date = null;
    book.rental_info.user_name = "";
    book.rental_info.user_email = "";

    const res = await fetch(`/api/books/${book?.manage_id}`, {
      method: "PUT",
      body: JSON.stringify(book),
    });

    if (res.status === 200 || res.status === 201) {
      setMessage("Rental info updated");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Server Error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const initAll = async () => {
    if (
      confirm("이 기능은 모든 도서의 대여정보를 삭제합니다. 진행하시겠습니까? ")
    ) {
      const res = await fetch("/api/books/insert_bulk", { method: "PUT" });
      if (res.status === 200 || res.status === 201) {
        setMessage("Initialized all rental information");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Server Error");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-8 gap-10">
      대여정보 초기화
      <form className="flex gap-10 items-end justify-end" onSubmit={searchBook}>
        <BookIDInput
          id="fourdigitinput"
          onValueChanged={(id) => {
            setManageID(id);
          }}
        />
        <button
          type="submit"
          className="border rounded-xl px-2 py-1 hover:bg-slate-200"
        >
          {" "}
          대여 정보 검색
        </button>
      </form>
      <p className="text-sm text-red-600">{message}</p>
      {book !== null ? (
        <div className="block">
          <div className="flex gap-4">
            <p className="min-w-32">대여상태:</p>
            <p className="border-b-2">
              {book.rental_info.rent_available ? "대여 가능" : "대여중"}
            </p>
          </div>
          <div className="flex gap-4">
            <p className="min-w-32">사용자:</p>
            <p className="border-b-2">{book.rental_info.user_name}</p>
          </div>
          <div className="flex gap-4">
            <p className="min-w-32">사용자 이메일:</p>
            <p className="border-b-2">{book.rental_info.user_email}</p>
          </div>
          <div className="flex gap-4">
            <p className="min-w-32">대여일:</p>
            <p className="border-b-2">
              {book.rental_info.rent_date
                ? getDateString(new Date(book.rental_info.rent_date))
                : ""}
            </p>
          </div>
          <div className="flex gap-4">
            <p className="min-w-32">반납예정일:</p>
            <p className="border-b-2">
              {book.rental_info.expected_return_date
                ? getDateString(new Date(book.rental_info.expected_return_date))
                : ""}
            </p>
          </div>
          <div className="flex gap-4">
            <p className="min-w-32">반납일:</p>
            <p className="border-b-2">
              {book.rental_info.return_date
                ? getDateString(new Date(book.rental_info.return_date))
                : ""}
            </p>
          </div>
          <button
            className="w-full border px-2 pt-1 mt-8 rounded-xl hover:bg-slate-200"
            onClick={initRentalInfo}
          >
            대여정보 초기화
          </button>
        </div>
      ) : (
        ""
      )}
      <div className="flex justify-center">
        <button
          className="border rounded-xl text-red-700 px-2 py-1 hover:bg-red-100"
          onClick={initAll}
        >
          전체 초기화
        </button>
      </div>
    </div>
  );
}
