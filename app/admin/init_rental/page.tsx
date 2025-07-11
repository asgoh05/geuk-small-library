"use client";
import { getDateString } from "@/app/(general)/datetime";
import { IBookInternal } from "@/app/(models)/Book";
import BookIDInput from "@/app/components/BookIDInput";
import { BaseSyntheticEvent, useState } from "react";
import {
  FaSync,
  FaSearch,
  FaBook,
  FaUser,
  FaCalendar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTrash,
  FaHashtag,
  FaInfoCircle,
} from "react-icons/fa";

export default function InitRentalInfoPage() {
  const [manageID, setManageID] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [book, setBook] = useState<IBookInternal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const showMessage = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const searchBook = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (manageID === "") {
      showMessage("도서번호를 입력해주세요.", "error");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/books/${manageID}`);
      if (res.ok) {
        const bookData = await res.json();
        setBook(bookData as IBookInternal);
        showMessage("도서 정보를 찾았습니다.", "success");
      } else {
        setBook(null);
        showMessage("해당 도서번호의 도서를 찾을 수 없습니다.", "error");
      }
    } catch (error) {
      setBook(null);
      showMessage("서버 통신 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const initRentalInfo = async () => {
    if (book === null) return;

    if (
      !confirm(
        `도서번호 ${book.manage_id}의 대여정보를 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedBook = {
        ...book,
        rental_info: {
          rent_available: true,
          expected_return_date: null,
          rent_date: null,
          return_date: null,
          user_name: "",
          user_email: "",
        },
      };

      const res = await fetch(`/api/books/${book.manage_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBook),
      });

      if (res.status === 200 || res.status === 201) {
        setBook(updatedBook);
        showMessage("대여정보가 성공적으로 초기화되었습니다.", "success");
      } else {
        showMessage("대여정보 초기화 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      showMessage("서버 통신 중 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const initAll = async () => {
    const warningMessage = `⚠️ 전체 대여정보 초기화 ⚠️

이 작업은 다음과 같은 결과를 가져옵니다:
• 모든 도서의 대여정보가 삭제됩니다
• 모든 대여자 정보가 제거됩니다
• 모든 대여일, 반납일 정보가 사라집니다
• 이 작업은 되돌릴 수 없습니다

정말로 전체 대여정보를 초기화하시겠습니까?`;

    if (!confirm(warningMessage)) {
      return;
    }

    // 두 번째 확인
    if (!confirm("정말로 확실하십니까? 이 작업은 되돌릴 수 없습니다!")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/books/insert_bulk", { method: "PUT" });
      if (res.status === 200 || res.status === 201) {
        showMessage("모든 대여정보가 성공적으로 초기화되었습니다.", "success");
        setBook(null); // 현재 표시된 도서 정보도 초기화
      } else {
        showMessage("전체 초기화 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      showMessage("서버 통신 중 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <FaSync className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">대여정보 초기화</h1>
            <p className="text-orange-100">
              도서의 대여정보를 초기화하여 대여 가능 상태로 변경합니다
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            messageType === "error"
              ? "bg-red-50 border-red-500 text-red-700"
              : messageType === "success"
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {messageType === "error" ? (
              <FaTimesCircle />
            ) : messageType === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaInfoCircle />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* 도서 검색 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaSearch className="text-orange-600" />
          도서 검색
        </h2>

        <form onSubmit={searchBook} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="manage_id"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <FaHashtag className="text-gray-500" />
              도서 번호
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <BookIDInput
                  id="fourdigitinput"
                  onValueChanged={(id) => setManageID(id)}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || isLoading}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    검색 중...
                  </>
                ) : (
                  <>
                    <FaSearch />
                    검색
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            4자리 도서번호를 입력하고 검색 버튼을 클릭하세요
          </p>
        </form>
      </div>

      {/* 도서 정보 표시 */}
      {book && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaBook className="text-blue-600" />
            도서 정보
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">
                기본 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaHashtag className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">도서번호</p>
                    <p className="font-semibold text-gray-900">
                      {book.manage_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaBook className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">제목</p>
                    <p className="font-semibold text-gray-900">{book.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaUser className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">저자</p>
                    <p className="font-semibold text-gray-900">{book.author}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 대여 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">
                대여 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      book.rental_info.rent_available
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <p className="text-sm text-gray-600">대여 상태</p>
                    <p
                      className={`font-semibold ${
                        book.rental_info.rent_available
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {book.rental_info.rent_available
                        ? "대여 가능"
                        : "대여 중"}
                    </p>
                  </div>
                </div>

                {!book.rental_info.rent_available && (
                  <>
                    <div className="flex items-start gap-3">
                      <FaUser className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">대여자</p>
                        <p className="font-semibold text-gray-900">
                          {book.rental_info.user_name || "정보 없음"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {book.rental_info.user_email || "이메일 없음"}
                        </p>
                      </div>
                    </div>

                    {book.rental_info.rent_date && (
                      <div className="flex items-start gap-3">
                        <FaCalendar className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">대여일</p>
                          <p className="font-semibold text-gray-900">
                            {getDateString(
                              new Date(book.rental_info.rent_date)
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {book.rental_info.expected_return_date && (
                      <div className="flex items-start gap-3">
                        <FaCalendar className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">반납예정일</p>
                          <p
                            className={`font-semibold ${
                              new Date(book.rental_info.expected_return_date) <
                              new Date()
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {getDateString(
                              new Date(book.rental_info.expected_return_date)
                            )}
                            {new Date(book.rental_info.expected_return_date) <
                              new Date() && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                연체
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 초기화 버튼 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={initRentalInfo}
              disabled={isLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  초기화 중...
                </>
              ) : (
                <>
                  <FaSync />이 도서의 대여정보 초기화
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 전체 초기화 섹션 */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <FaExclamationTriangle className="text-red-600 text-xl mt-1" />
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-2">위험 구역</h2>
            <p className="text-red-800 text-sm">
              아래 기능은 모든 도서의 대여정보를 삭제합니다. 매우 신중하게
              사용하세요.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-red-300">
          <h3 className="font-semibold text-red-900 mb-2">
            전체 대여정보 초기화
          </h3>
          <p className="text-sm text-red-700 mb-4">
            이 작업은 모든 도서의 대여정보를 삭제하고 모든 도서를 대여 가능
            상태로 변경합니다. 실행 후에는 되돌릴 수 없습니다.
          </p>
          <button
            onClick={initAll}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <FaTrash />
                전체 대여정보 초기화
              </>
            )}
          </button>
        </div>
      </div>

      {/* 도움말 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          사용 안내
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            • <strong>개별 초기화:</strong> 특정 도서의 대여정보만 초기화하여
            대여 가능 상태로 변경합니다.
          </p>
          <p>
            • <strong>전체 초기화:</strong> 모든 도서의 대여정보를 한 번에
            초기화합니다. 매우 주의해서 사용하세요.
          </p>
          <p>
            • <strong>초기화 효과:</strong> 대여자 정보, 대여일, 반납예정일 등
            모든 대여 관련 정보가 삭제됩니다.
          </p>
          <p>
            • <strong>복구 불가:</strong> 한 번 초기화된 정보는 복구할 수
            없으므로 신중하게 결정하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
