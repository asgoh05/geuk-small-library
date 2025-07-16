"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBook,
  FaUsers,
  FaExclamationTriangle,
  FaChartLine,
  FaPlus,
  FaFileExcel,
  FaDownload,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
} from "react-icons/fa";

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  rentedBooks: number;
  overdueBooks: number;
  activeUsers: number;
  bannedUsers: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    rentedBooks: 0,
    overdueBooks: 0,
    activeUsers: 0,
    bannedUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [testEmailSending, setTestEmailSending] = useState(false);

  // 테스트 이메일 발송 함수
  const sendTestEmail = async () => {
    if (testEmailSending) return;

    if (
      !confirm(
        "Gmail SMTP 테스트 이메일을 발송하시겠습니까?\n\n로그인된 관리자의 회사 이메일로 발송됩니다."
      )
    ) {
      return;
    }

    setTestEmailSending(true);

    try {
      console.log("테스트 이메일 발송 중...");
      const response = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "테스트 이메일 발송에 실패했습니다.");
      }

      // 성공 메시지
      alert(
        `테스트 이메일 발송 성공! 🎉\n\n${result.message}\n\n수신자: ${result.details.recipient}\n발송 시간: ${result.details.sent_at}`
      );
    } catch (error) {
      console.error("테스트 이메일 발송 오류:", error);
      alert(
        `테스트 이메일 발송에 실패했습니다.\n\n오류: ${
          (error as Error).message
        }\n\nGMAIL_SETUP.md 파일을 참고하여 Gmail SMTP 설정을 확인해주세요.`
      );
    } finally {
      setTestEmailSending(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "통계 데이터를 가져오는데 실패했습니다."
          );
        }

        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          throw new Error("잘못된 응답 형식입니다.");
        }
      } catch (error) {
        console.error("통계 데이터 조회 실패:", error);
        // 오류 발생시 기본값 설정
        setStats({
          totalBooks: 0,
          totalUsers: 0,
          rentedBooks: 0,
          overdueBooks: 0,
          activeUsers: 0,
          bannedUsers: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "도서 추가",
      description: "새 도서를 개별 등록",
      href: "/admin/addbook",
      icon: <FaPlus className="text-xl" />,
      color: "bg-green-500 hover:bg-green-600",
      onClick: undefined,
    },
    {
      title: "Excel 도서 추가",
      description: "엑셀 파일로 일괄 등록",
      href: "/admin/addbookExcel",
      icon: <FaFileExcel className="text-xl" />,
      color: "bg-emerald-500 hover:bg-emerald-600",
      onClick: undefined,
    },
    {
      title: "사용자 관리",
      description: "사용자 권한 및 상태 관리",
      href: "/admin/users",
      icon: <FaUsers className="text-xl" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      onClick: undefined,
    },
    {
      title: "데이터 내보내기",
      description: "도서 목록 Excel 다운로드",
      href: "/admin/export",
      icon: <FaDownload className="text-xl" />,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: undefined,
    },
    {
      title: "Gmail 테스트",
      description: "SMTP 설정 테스트 이메일",
      href: undefined,
      icon: <FaEnvelope className="text-xl" />,
      color: testEmailSending
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600",
      onClick: sendTestEmail,
    },
    {
      title: "연체 알림 발송",
      description: "연체된 도서 이메일 알림 관리",
      href: "/admin/send-email",
      icon: <FaEnvelope className="text-xl" />,
      color: "bg-red-500 hover:bg-red-600",
      onClick: undefined,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-blue-100">도서관 시스템을 효율적으로 관리하세요</p>
      </div>

      {/* 도서 관리 현황 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaBook className="text-blue-600" />
          도서 관리 현황
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">총 도서 수</p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.totalBooks.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">등록된 전체 도서</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <FaBook className="text-blue-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">대여 중</p>
                <p className="text-3xl font-bold text-orange-900">
                  {stats.rentedBooks}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  현재 대여 중인 도서
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-lg">
                <FaClock className="text-orange-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  대여 가능
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {(stats.totalBooks - stats.rentedBooks).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  대여 가능한 도서
                </p>
              </div>
              <div className="bg-emerald-200 p-3 rounded-lg">
                <FaCheckCircle className="text-emerald-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">연체 도서</p>
                <p className="text-3xl font-bold text-red-900">
                  {stats.overdueBooks}
                </p>
                <p className="text-xs text-red-600 mt-1">반납 기한 초과</p>
              </div>
              <div className="bg-red-200 p-3 rounded-lg">
                <FaExclamationTriangle className="text-red-700 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 관리 현황 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaUsers className="text-green-600" />
          사용자 관리 현황
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">총 사용자</p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.totalUsers}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  등록된 전체 사용자
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <FaUsers className="text-green-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">활성 사용자</p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  정상 이용 중인 사용자
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <FaCheckCircle className="text-blue-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">차단 사용자</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.bannedUsers}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  이용이 제한된 사용자
                </p>
              </div>
              <div className="bg-gray-200 p-3 rounded-lg">
                <FaTimesCircle className="text-gray-700 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시스템 알림 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-600" />
            대여 현황 요약
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-900">대여율</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {stats.totalBooks > 0
                  ? Math.round((stats.rentedBooks / stats.totalBooks) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="font-medium text-emerald-900">가용률</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">
                {stats.totalBooks > 0
                  ? Math.round(
                      ((stats.totalBooks - stats.rentedBooks) /
                        stats.totalBooks) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            {stats.rentedBooks > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-900">연체율</span>
                </div>
                <span className="text-lg font-bold text-red-700">
                  {Math.round((stats.overdueBooks / stats.rentedBooks) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-600" />
            시스템 알림
          </h2>
          <div className="space-y-3">
            {stats.overdueBooks > 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaExclamationTriangle className="text-red-500 text-sm" />
                  <span className="font-semibold text-red-800">연체 알림</span>
                </div>
                <p className="text-sm text-red-700">
                  현재 {stats.overdueBooks}권의 도서가 연체되었습니다.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="font-semibold text-green-800">
                    연체 없음
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  현재 연체된 도서가 없습니다.
                </p>
              </div>
            )}

            {stats.bannedUsers > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaTimesCircle className="text-orange-500 text-sm" />
                  <span className="font-semibold text-orange-800">
                    사용자 관리
                  </span>
                </div>
                <p className="text-sm text-orange-700">
                  {stats.bannedUsers}명의 사용자가 차단되어 있습니다.
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FaCheckCircle className="text-blue-500 text-sm" />
                <span className="font-semibold text-blue-800">시스템 상태</span>
              </div>
              <p className="text-sm text-blue-700">
                도서관 시스템이 정상 운영 중입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            // 링크가 있는 경우
            if (action.href) {
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">{action.icon}</div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </Link>
              );
            }

            // 클릭 함수가 있는 경우
            return (
              <button
                key={index}
                onClick={action.onClick}
                disabled={testEmailSending}
                className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:hover:scale-100`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    {testEmailSending && action.title === "Gmail 테스트" ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      action.icon
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">
                    {testEmailSending && action.title === "Gmail 테스트"
                      ? "테스트 중..."
                      : action.title}
                  </h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
