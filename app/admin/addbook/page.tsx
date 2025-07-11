"use client";
import { BaseSyntheticEvent, useState } from "react";
import FourDigitInput from "@/app/components/FourDigitInput";
import BookIDInput from "@/app/components/BookIDInput";
import {
  FaBook,
  FaUser,
  FaCalendar,
  FaComment,
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaHashtag,
  FaSave,
} from "react-icons/fa";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: BaseSyntheticEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/books`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 200 || res.status === 201) {
        setMessage(
          `도서가 성공적으로 등록되었습니다! (도서번호: ${formData.manage_id})`
        );
        setTimeout(() => setMessage(""), 5000);
        setServerError(false);
        setFormData(initFormData);
        // 도서번호 입력 필드로 포커스 이동
        setTimeout(() => {
          window.document.getElementById("fourdigitinput")?.focus();
        }, 100);
      } else {
        const errorData = await res.json();
        setMessage(
          errorData.err?.message || "도서 등록 중 오류가 발생했습니다."
        );
        setTimeout(() => setMessage(""), 5000);
        setServerError(true);
      }
    } catch (error) {
      setMessage("서버와의 통신 중 오류가 발생했습니다.");
      setTimeout(() => setMessage(""), 5000);
      setServerError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function setManageID(bookid: String) {
    setFormData((preState) => ({
      ...preState,
      manage_id: `${bookid}`,
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

  const isFormValid = formData.manage_id && formData.title && formData.author;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <FaPlus className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">새 도서 등록</h1>
            <p className="text-green-100">도서관에 새로운 도서를 추가합니다</p>
          </div>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            serverError
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-green-50 border-green-500 text-green-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {serverError ? (
              <FaExclamationCircle className="text-red-500" />
            ) : (
              <FaCheckCircle className="text-green-500" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* 도서 등록 폼 */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaBook className="text-green-600" />
            도서 정보 입력
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            <span className="text-red-500">*</span> 표시된 항목은 필수 입력
            사항입니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 도서번호 */}
          <div className="space-y-2">
            <label
              htmlFor="manage_id"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <FaHashtag className="text-gray-500" />
              <span className="text-red-500">*</span>
              도서 번호
            </label>
            <div className="relative">
              <BookIDInput id="fourdigitinput" onValueChanged={setManageID} />
            </div>
            <p className="text-xs text-gray-500">
              4자리 숫자로 구성된 고유 도서 번호를 입력하세요
            </p>
          </div>

          {/* 책 제목 */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <FaBook className="text-gray-500" />
              <span className="text-red-500">*</span>책 제목
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              name="title"
              type="text"
              placeholder="예: 이기적인 유전자"
              onChange={handleChange}
              value={formData.title}
              required
            />
          </div>

          {/* 저자 */}
          <div className="space-y-2">
            <label
              htmlFor="author"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <FaUser className="text-gray-500" />
              <span className="text-red-500">*</span>
              저자
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              name="author"
              type="text"
              placeholder="예: 리처드 도킨스"
              onChange={handleChange}
              value={formData.author}
              required
            />
          </div>

          {/* 등록일 */}
          <div className="space-y-2">
            <label
              htmlFor="reg_date"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <FaCalendar className="text-gray-500" />
              <span className="text-red-500">*</span>
              등록일
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
              name="reg_date"
              required
              onChange={handlRegDateChange}
              value={formData.reg_date.toLocaleDateString("en-CA")}
            />
          </div>

          {/* 코멘트 */}
          <div className="space-y-2">
            <label
              htmlFor="comments"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <FaComment className="text-gray-500" />
              코멘트 (선택사항)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
              name="comments"
              rows={4}
              placeholder="도서에 대한 추가 정보나 메모를 입력하세요..."
              onChange={handleChange}
              value={formData.comments}
            />
          </div>

          {/* 등록 버튼 */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                isFormValid && !isSubmitting
                  ? "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-[1.02]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  등록 중...
                </>
              ) : (
                <>
                  <FaSave className="text-lg" />
                  도서 등록하기
                </>
              )}
            </button>

            {!isFormValid && (
              <p className="text-center text-sm text-gray-500 mt-2">
                필수 항목을 모두 입력해주세요
              </p>
            )}
          </div>
        </form>
      </div>

      {/* 도움말 섹션 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FaBook className="text-blue-600" />
          도서 등록 안내
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            도서번호는 4자리 숫자로 입력하며, 중복될 수 없습니다.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>책 제목과 저자명은
            정확히 입력해주세요.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            등록일은 도서가 도서관에 등록된 실제 날짜를 입력합니다.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            코멘트에는 도서의 상태, 위치 등 추가 정보를 입력할 수 있습니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
