"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaHome,
  FaPlus,
  FaFileExcel,
  FaDownload,
  FaUsers,
  FaTimes,
  FaCog,
  FaEnvelope,
  FaSync,
  FaChevronDown,
} from "react-icons/fa";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function AdminNav() {
  const pathname = usePathname();
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const mainNavItems: NavItem[] = [
    {
      href: "/admin",
      label: "대시보드",
      icon: <FaHome className="text-lg" />,
      description: "관리자 대시보드",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    },
    {
      href: "/admin/addbook",
      label: "도서 추가",
      icon: <FaPlus className="text-lg" />,
      description: "새 도서 등록",
      color: "text-green-600 bg-green-50 hover:bg-green-100",
    },
    {
      href: "/admin/addbookExcel",
      label: "Excel 등록",
      icon: <FaFileExcel className="text-lg" />,
      description: "엑셀로 일괄 등록",
      color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
    },
    {
      href: "/admin/books",
      label: "도서 관리",
      icon: <FaCog className="text-lg" />,
      description: "도서 수정 및 삭제",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
    {
      href: "/admin/users",
      label: "사용자 관리",
      icon: <FaUsers className="text-lg" />,
      description: "사용자 권한 관리",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
    },
    {
      href: "/admin/export",
      label: "데이터 내보내기",
      icon: <FaDownload className="text-lg" />,
      description: "엑셀 다운로드",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    },
    {
      href: "/admin/send-email",
      label: "연체 알림",
      icon: <FaEnvelope className="text-lg" />,
      description: "연체 이메일 발송",
      color: "text-red-600 bg-red-50 hover:bg-red-100",
    },
  ];

  const quickActions: NavItem[] = [
    {
      label: "Gmail 테스트",
      icon: <FaEnvelope className="text-lg" />,
      description: "SMTP 설정 테스트",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
      onClick: sendTestEmail,
      isLoading: testEmailSending,
    },
    {
      href: "/admin/init_rental",
      label: "대여정보 초기화",
      icon: <FaSync className="text-lg" />,
      description: "대여 정보 리셋",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mb-8 sticky top-0 z-50">
      <div className="flex items-center justify-between py-4 px-8">
        {/* 로고 및 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
            <FaCog className="text-xl text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">관리자 패널</h1>
            <p className="text-sm text-gray-500">도서관 시스템 관리</p>
          </div>
        </div>

        {/* 메인 네비게이션 */}
        <div className="flex items-center gap-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href || item.label}
                href={item.href || "#"}
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={item.description}
              >
                {item.icon}
                <span className="hidden lg:inline text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}

          {/* 빠른 작업 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 flex items-center gap-2"
              title="빠른 작업"
            >
              <FaCog className="text-lg" />
              <span className="hidden lg:inline text-sm">빠른 작업</span>
              <FaChevronDown
                className={`text-xs transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                {quickActions.map((action, index) => {
                  if (action.href) {
                    return (
                      <Link
                        key={index}
                        href={action.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        title={action.description}
                      >
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          {action.icon}
                        </div>
                        <div>
                          <p className="font-medium">{action.label}</p>
                          <p className="text-xs text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setDropdownOpen(false);
                        action.onClick?.();
                      }}
                      disabled={action.isLoading}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={action.description}
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        {action.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          action.icon
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">
                          {action.isLoading ? "테스트 중..." : action.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <FaTimes className="text-sm" />
          <span className="hidden sm:inline">닫기</span>
        </Link>
      </div>

      {/* 드롭다운 배경 클릭시 닫기 */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
}
