"use client";
import { BaseSyntheticEvent, useState } from "react";
import FourDigitInput from "@/app/components/FourDigitInput";
import Link from "next/link";

export default function AdminPage() {
  const initFormData = {
    manage_id: "",
    title: "",
    author: "",
    img_url: "",
    reg_date: Date.now(),
    comments: "",
    rental_info: {
      rent_available: true,
      rent_date: null,
      return_date: null,
      user_name: "",
      user_email: "",
    },
  };
  const [formData, setFormData] = useState(initFormData);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState(false);

  async function handleSubmit(e: BaseSyntheticEvent) {
    e.preventDefault();

    const res = await fetch(`/api/books`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (res.status === 200 || res.status === 201) {
      setMessage(`Created Book 도서번호: ${formData.manage_id}`);
      setTimeout(() => setMessage(""), 5000);
      setServerError(false);
      setFormData(initFormData);
      window.document.getElementById("fourdigitinput")?.focus();
    } else {
      const message = await res.json();
      setMessage(message.err.message);
      setTimeout(() => setMessage(""), 5000);
      setServerError(true);
    }
  }

  function setManageID(bookid: String) {
    setFormData((preState) => ({
      ...preState,
      manage_id: `GEUK_BOOK_${bookid}`,
    }));
  }

  function handleChange(e: BaseSyntheticEvent) {
    const value = e.target.value;
    const name = e.target.name;

    setFormData((preState) => ({
      ...preState,
      [name]: value,
    }));
  }

  return (
    <div className="flex flex-col items-center justify-between p-12">
      <Link
        href="/"
        className="absolute top-10 left-10 rounded-full bg-slate-300 p-4 hover:bg-slate-600 hover:text-white cursor-pointer"
      >
        Home
      </Link>
      Admin Page
      <form className="p-10 flex flex-col" onSubmit={handleSubmit}>
        <div className="flex justify-between">
          <div className="flex items-baseline">
            <label className="p-2" htmlFor="manage_id">
              도서 번호
            </label>
            <p className="align-bottom text-neutral-600">GEUK_BOOK_</p>
            <FourDigitInput id="fourdigitinput" onValueChanged={setManageID} />
          </div>
          {/* <input
            className="m-2 p-1 rounded text-black"
            name="manage_id"
            type="text"
            placeholder="GEUK_BOOK_xx-yy"
            onChange={handleChange}
            value={formData.manage_id}
          ></input> */}
        </div>
        <div className="flex justify-between">
          <label className="p-2" htmlFor="title">
            책 제목
          </label>
          <input
            className="m-2 p-1 rounded text-black"
            name="title"
            type="text"
            placeholder="이기적인 유전자"
            onChange={handleChange}
            value={formData.title}
          ></input>
        </div>
        <div className="flex justify-between">
          <label className="p-2" htmlFor="author">
            저자
          </label>
          <input
            className="m-2 p-1 rounded text-black"
            name="author"
            type="text"
            placeholder="리처드 도킨슨"
            onChange={handleChange}
            value={formData.author}
          ></input>
        </div>

        <button
          className="p-2 m-2 rounded-lg hover:bg-slate-500 hover:text-slate-50"
          type="submit"
        >
          등록하기
        </button>
      </form>
      <p className={serverError ? "text-red-400" : "text-green-400"}>
        {message}
      </p>
    </div>
  );
}
