"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminGuard from "../components/AdminGuard";
import LoadingSpinner from "@/app/components/LoadingSpinner";

// 연체 도서 정보 타입 정의
interface OverdueBookInfo {
  book: {
    manage_id: string;
    title: string;
    author: string;
    rent_date: string;
    expected_return_date: string;
  };
  user: {
    real_name: string;
    email: string;
    company_email: string | null;
    is_registered?: boolean;
  };
  overdue_days: number;
}

interface OverdueResponse {
  success: boolean;
  total_rented: number;
  total_overdue: number;
  valid_overdue: number;
  overdue_books: OverdueBookInfo[];
  error?: string;
}

interface EmailResult {
  user_name: string;
  book_title: string;
  email: string;
  status: string;
  overdue_days: number;
  error?: string;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  total: number;
  success_count: number;
  fail_count: number;
  test_mode: boolean;
  results: EmailResult[];
  error?: string;
}

export default function SendEmailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [overdueBooks, setOverdueBooks] = useState<OverdueBookInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<EmailResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("관리자 이메일");
  const [loadingAdminEmail, setLoadingAdminEmail] = useState(true);

  // 관리자 이메일 정보 로드
  const loadAdminEmail = useCallback(async () => {
    try {
      setLoadingAdminEmail(true);
      const response = await fetch("/api/admin/current-user");
      const data = await response.json();

      if (response.ok && data.success) {
        const email = data.user.company_email || data.user.email;
        setAdminEmail(email);
      } else {
        console.warn("관리자 이메일 조회 실패:", data.error);
        setAdminEmail("sanggeon.oh@gehealthcare.com"); // 기본값
      }
    } catch (err) {
      console.warn("관리자 이메일 조회 오류:", err);
      setAdminEmail("sanggeon.oh@gehealthcare.com"); // 기본값
    } finally {
      setLoadingAdminEmail(false);
    }
  }, []);

  // 연체 도서 데이터 로드
  const loadOverdueBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/check-overdue");
      const data: OverdueResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "연체 도서 조회에 실패했습니다.");
      }

      if (data.success) {
        setOverdueBooks(data.overdue_books);
        // 기본적으로 모든 항목 선택
        setSelectedItems(new Set(data.overdue_books.map((_, index) => index)));
      } else {
        throw new Error("연체 도서 데이터를 가져올 수 없습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverdueBooks();
    loadAdminEmail();
  }, [loadOverdueBooks, loadAdminEmail]);

  // 연체가 오래된 순으로 정렬된 배열
  const sortedOverdueBooks = useMemo(() => {
    return [...overdueBooks].sort((a, b) => b.overdue_days - a.overdue_days);
  }, [overdueBooks]);

  // 전체 선택/해제
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedItems(new Set(sortedOverdueBooks.map((_, index) => index)));
      } else {
        setSelectedItems(new Set());
      }
    },
    [sortedOverdueBooks]
  );

  // 개별 선택/해제
  const handleSelectItem = useCallback((index: number, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  // 선택된 항목들 (정렬된 배열 기준)
  const selectedOverdueBooks = useMemo(() => {
    return sortedOverdueBooks.filter((_, index) => selectedItems.has(index));
  }, [sortedOverdueBooks, selectedItems]);

  // 전체 선택 상태
  const isAllSelected = useMemo(() => {
    return (
      sortedOverdueBooks.length > 0 &&
      selectedItems.size === sortedOverdueBooks.length
    );
  }, [sortedOverdueBooks.length, selectedItems.size]);

  // 일부 선택 상태
  const isPartiallySelected = useMemo(() => {
    return (
      selectedItems.size > 0 && selectedItems.size < sortedOverdueBooks.length
    );
  }, [sortedOverdueBooks.length, selectedItems.size]);

  // 이메일 발송
  const handleSendEmails = useCallback(async () => {
    if (selectedOverdueBooks.length === 0) {
      alert("발송할 대상을 선택해주세요.");
      return;
    }

    const confirmMessage = testMode
      ? `테스트 모드로 ${selectedOverdueBooks.length}건의 알림을 ${adminEmail}로 발송하시겠습니까?`
      : `실제 운영 모드로 ${selectedOverdueBooks.length}건의 알림을 발송하시겠습니까?\n\n⚠️ 실제 사용자들에게 이메일이 발송됩니다!`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setSending(true);
      setSendResults(null);
      setShowResults(false);

      const response = await fetch("/api/admin/send-overdue-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overdueBooks: selectedOverdueBooks,
          testMode: testMode,
        }),
      });

      const data: SendEmailResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "이메일 발송에 실패했습니다.");
      }

      if (data.success) {
        setSendResults(data.results);
        setShowResults(true);
        alert(
          `이메일 발송 완료!\n성공: ${data.success_count}건\n실패: ${data.fail_count}건`
        );
      } else {
        throw new Error(data.message || "이메일 발송에 실패했습니다.");
      }
    } catch (err) {
      alert(
        `이메일 발송 실패: ${
          err instanceof Error ? err.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setSending(false);
    }
  }, [selectedOverdueBooks, testMode, adminEmail]);

  // 날짜 포맷 함수
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  📧 연체 알림 메일 발송
                </h1>
                <p className="text-sm text-gray-600">
                  연체된 도서가 있는 사용자들에게 알림 메일을 발송합니다.
                </p>
              </div>
              <button
                onClick={() => router.push("/admin")}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← 관리자 페이지로
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-3">❌</div>
                <div>
                  <h3 className="text-red-800 font-medium">오류 발생</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={loadOverdueBooks}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {!error && (
            <>
              {/* 발송 설정 */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testMode}
                        onChange={(e) => setTestMode(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        테스트 모드 (
                        {loadingAdminEmail
                          ? "관리자 이메일 확인 중..."
                          : adminEmail}
                        로만 발송)
                      </span>
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">
                    총 {sortedOverdueBooks.length}건 중 {selectedItems.size}건
                    선택됨
                  </div>
                </div>
              </div>

              {/* 연체 도서 목록 */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      연체 도서 목록 ({sortedOverdueBooks.length}건)
                    </h2>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isPartiallySelected;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          전체 선택
                        </span>
                      </label>
                      <button
                        onClick={handleSendEmails}
                        disabled={selectedItems.size === 0 || sending}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedItems.size === 0 || sending
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : testMode
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {sending ? (
                          <div className="flex items-center">
                            <LoadingSpinner />
                            <span className="ml-2">발송 중...</span>
                          </div>
                        ) : (
                          `${testMode ? "테스트" : "실제"} 발송 (${
                            selectedItems.size
                          }건)`
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {sortedOverdueBooks.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-green-600 text-4xl mb-4">🎉</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      연체된 도서가 없습니다!
                    </h3>
                    <p className="text-gray-500">
                      현재 모든 도서가 정상적으로 관리되고 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* 테이블 헤더 */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1">선택</div>
                        <div className="col-span-2">사용자</div>
                        <div className="col-span-4">도서 정보</div>
                        <div className="col-span-2">연체 정보</div>
                        <div className="col-span-3">발송 정보</div>
                      </div>
                    </div>

                    {/* 테이블 내용 */}
                    <div className="divide-y divide-gray-200">
                      {sortedOverdueBooks.map((item, index) => (
                        <div
                          key={index}
                          className={`px-6 py-3 hover:bg-gray-50 transition-colors ${
                            selectedItems.has(index) ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-3 items-center">
                            {/* 선택 체크박스 */}
                            <div className="col-span-1">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(index)}
                                onChange={(e) =>
                                  handleSelectItem(index, e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </div>

                            {/* 사용자 정보 */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {item.user.real_name}
                                </span>
                                {item.user.is_registered === false && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    미등록
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {item.user.email}
                              </div>
                            </div>

                            {/* 도서 정보 */}
                            <div className="col-span-4">
                              <div
                                className="font-medium text-gray-900 text-sm mb-1"
                                title={item.book.title}
                              >
                                {item.book.title.length > 30
                                  ? `${item.book.title.substring(0, 30)}...`
                                  : item.book.title}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>📖 {item.book.author}</span>
                                <span>📚 {item.book.manage_id}</span>
                              </div>
                            </div>

                            {/* 연체 정보 */}
                            <div className="col-span-2">
                              <div className="mb-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.overdue_days}일 연체
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                대여: {formatDate(item.book.rent_date)}
                              </div>
                              <div className="text-xs text-red-600 font-medium">
                                반납:{" "}
                                {formatDate(item.book.expected_return_date)}
                              </div>
                            </div>

                            {/* 발송 정보 */}
                            <div className="col-span-3">
                              {testMode ? (
                                <div className="text-xs">
                                  <div className="text-blue-600 font-medium mb-1">
                                    관리자 이메일
                                  </div>
                                  <div className="text-gray-500 truncate">
                                    {loadingAdminEmail
                                      ? "확인 중..."
                                      : adminEmail}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 mb-1">
                                    {item.user.company_email
                                      ? "회사 이메일"
                                      : "개인 이메일"}
                                  </div>
                                  <div className="text-gray-500 truncate">
                                    {item.user.company_email || item.user.email}
                                  </div>
                                  {!item.user.company_email && (
                                    <div className="text-orange-600 text-xs mt-1">
                                      {item.user.is_registered === false
                                        ? "미등록 사용자"
                                        : "회사 이메일 없음"}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 발송 결과 */}
              {showResults && sendResults && (
                <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      📋 발송 결과
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {sendResults.map((result, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">
                              {result.user_name} - {result.book_title}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {result.email} • {result.overdue_days}일 연체
                            </p>
                          </div>
                          <div className="flex items-center">
                            {result.status === "success" ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ 발송 성공
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ❌ 발송 실패
                              </span>
                            )}
                          </div>
                        </div>
                        {result.error && (
                          <p className="mt-2 text-xs text-red-600">
                            오류: {result.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
