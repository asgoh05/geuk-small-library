"use client";
import { BaseSyntheticEvent, useState } from "react";
import FourDigitInput from "@/app/components/FourDigitInput";
import BookIDInput from "@/app/components/BookIDInput";

export default function AddBookPage() {
  const initFormData = {
    manage_id: "",
    title: "",
    author: "",
    img_url: "",
    reg_date: new Date(Date.now()),
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
      manage_id: bookid,
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

  function handlRegDateChange(e: BaseSyntheticEvent) {
    let date = e.target.value;
    if (date === "") date = Date.now();
    setFormData((preState) => ({
      ...preState,
      ["reg_date"]: new Date(date),
    }));
  }

  return (
    <div className="flex flex-col items-center justify-between p-8">
      도서 추가
      <form className="p-10 flex flex-col w-1/2" onSubmit={handleSubmit}>
        <div className="flex items-baseline">
          <label className="p-2 min-w-32" htmlFor="manage_id">
            <sup className="text-red-700">*</sup>도서 번호
          </label>
          <BookIDInput id="fourdigitinput" onValueChanged={setManageID} />
        </div>
        <div className="flex justify-between">
          <label className="p-2 min-w-32" htmlFor="title">
            <sup className="text-red-700">*</sup>책 제목
          </label>
          <input
            className="m-2 p-1 w-full rounded text-black"
            name="title"
            type="text"
            placeholder="이기적인 유전자"
            onChange={handleChange}
            value={formData.title}
          ></input>
        </div>
        <div className="flex justify-between">
          <label className="p-2 min-w-32" htmlFor="author">
            <sup className="text-red-700">*</sup>저자
          </label>
          <input
            className="m-2 p-1 w-full rounded text-black"
            name="author"
            type="text"
            placeholder="리처드 도킨슨"
            onChange={handleChange}
            value={formData.author}
          ></input>
        </div>
        <div className="flex justify-between">
          <label className="p-2 min-w-32" htmlFor="comments">
            코멘트
          </label>
          <textarea
            className="m-2 p-1 w-full rounded text-black line-clamp-5"
            name="comments"
            onChange={handleChange}
            value={formData.comments}
          ></textarea>
        </div>
        <div className="flex justify-between">
          <label className="p-2 min-w-32" htmlFor="reg_date">
            <sup className="text-red-700">*</sup>등록일
          </label>
          <input
            type="date"
            className="m-2 p-1 w-full rounded text-black line-clamp-5"
            name="reg_date"
            required
            onChange={handlRegDateChange}
            value={formData.reg_date.toLocaleDateString("en-CA")}
          ></input>
        </div>
        <button
          className="mx-12 py-2 m-2 rounded-lg bg-slate-200 hover:bg-slate-500 hover:text-slate-50"
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
