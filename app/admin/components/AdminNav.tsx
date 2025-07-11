"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaPlus,
  FaFileExcel,
  FaDownload,
  FaSync,
  FaUsers,
  FaTimes,
  FaBook,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "관리자 홈",
    icon: <FaHome className="text-lg" />,
    description: "관리자 대시보드",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    href: "/admin/addbook",
    label: "도서 추가",
    icon: <FaPlus className="text-lg" />,
    description: "새 도서 수동 등록",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    href: "/admin/addbookExcel",
    label: "Excel 도서 추가",
    icon: <FaFileExcel className="text-lg" />,
    description: "엑셀 파일로 도서 일괄 등록",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    href: "/admin/export",
    label: "Excel 내보내기",
    icon: <FaDownload className="text-lg" />,
    description: "도서 목록 엑셀 다운로드",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    href: "/admin/init_rental",
    label: "대여정보 초기화",
    icon: <FaSync className="text-lg" />,
    description: "대여 정보 리셋",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    href: "/admin/users",
    label: "사용자 관리",
    icon: <FaUsers className="text-lg" />,
    description: "사용자 권한 및 상태 관리",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-lg">
              <FaCog className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">관리자 패널</h1>
              <p className="text-slate-300 text-sm">도서관 시스템 관리</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <FaTimes className="text-sm" />
            닫기
          </Link>
        </div>
      </div>

      {/* 네비게이션 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                isActive ? "ring-4 ring-blue-300 shadow-xl" : "hover:shadow-xl"
              }`}
            >
              <div className={`${item.color} p-6 text-white relative`}>
                {/* 배경 패턴 */}
                <div className="absolute top-0 right-0 opacity-20">
                  <div className="w-24 h-24 transform rotate-12 translate-x-6 -translate-y-6">
                    {item.icon}
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{item.label}</h3>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* 활성 상태 표시 */}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/30 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium">활성</span>
                    </div>
                  </div>
                )}

                {/* 호버 효과 */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
