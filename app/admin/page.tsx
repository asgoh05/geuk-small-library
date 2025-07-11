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

  useEffect(() => {
    // 실제 데이터를 가져오는 API 호출을 시뮬레이션
    // 추후 실제 API로 교체 가능
    const fetchStats = async () => {
      try {
        // 임시로 하드코딩된 값 사용 (실제 API 구현 시 교체)
        setTimeout(() => {
          setStats({
            totalBooks: 1234,
            totalUsers: 67,
            rentedBooks: 45,
            overdueBooks: 3,
            activeUsers: 64,
            bannedUsers: 3,
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
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
    },
    {
      title: "Excel 도서 추가",
      description: "엑셀 파일로 일괄 등록",
      href: "/admin/addbookExcel",
      icon: <FaFileExcel className="text-xl" />,
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      title: "사용자 관리",
      description: "사용자 권한 및 상태 관리",
      href: "/admin/users",
      icon: <FaUsers className="text-xl" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "데이터 내보내기",
      description: "도서 목록 Excel 다운로드",
      href: "/admin/export",
      icon: <FaDownload className="text-xl" />,
      color: "bg-purple-500 hover:bg-purple-600",
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

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 도서 수</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalBooks.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaBook className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">등록 사용자</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaUsers className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">대여 중</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.rentedBooks}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaClock className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">연체 도서</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overdueBooks}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            시스템 현황
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                <span className="font-medium">활성 사용자</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.activeUsers}명
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaTimesCircle className="text-red-500" />
                <span className="font-medium">차단된 사용자</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {stats.bannedUsers}명
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaBook className="text-blue-500" />
                <span className="font-medium">대여 가능 도서</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {(stats.totalBooks - stats.rentedBooks).toLocaleString()}권
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">최근 알림</h2>
          <div className="space-y-3">
            {stats.overdueBooks > 0 && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm text-red-700">
                  {stats.overdueBooks}권의 도서가 연체되었습니다.
                </p>
              </div>
            )}
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-700">
                시스템이 정상적으로 운영 중입니다.
              </p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm text-green-700">
                모든 백업이 완료되었습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
