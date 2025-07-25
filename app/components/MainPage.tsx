"use client";
import SignInButton from "@/app/components/SignInButton";
import { useSession } from "next-auth/react";
import BookList from "./BookList";
import Link from "next/link";
import { FaBookBookmark } from "react-icons/fa6";
import {
  FaSearch,
  FaBook,
  FaUser,
  FaHashtag,
  FaEye,
  FaChartBar,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import BookIDInput from "./BookIDInput";

// Debounce hook for search optimization
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MainPage() {
  const { data: session } = useSession();
  const [searchKey, setSearchKey] = useState("");
  const [searchType, setSearchType] = useState<"title" | "author">("title");
  const [manageId, setManageId] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMybook, setShowMybook] = useState(false);
  const [openRentalInfoModal, setOpenRentalInfoModal] = useState(false);
  const [userRentalBooksCount, setUserRentalBooksCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search key for performance
  const debouncedSearchKey = useDebounce(searchKey, 300);
  const debouncedManageId = useDebounce(manageId, 300);

  // 검색창 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current
          .closest(".search-container")
          ?.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 모바일 검색 모달이 열릴 때 포커스
  useEffect(() => {
    if (showMobileSearch && mobileSearchInputRef.current) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
    }
  }, [showMobileSearch]);

  // ESC 키로 모바일 메뉴/검색 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMobileMenu(false);
        setShowMobileSearch(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchTypeChange = useCallback((type: "title" | "author") => {
    setSearchType(type);
    setSearchKey("");
  }, []);

  const handleSearchKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKey(e.target.value);
    },
    []
  );

  const handleManageIdChange = useCallback((id: string) => {
    setManageId(id);
  }, []);

  const handleUserRentalCountUpdate = useCallback((count: number) => {
    setUserRentalBooksCount(count);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setShowMobileSearch(false);
  }, []);

  const toggleMyBooks = useCallback(() => {
    setShowMybook(!showMybook);
    setShowMobileMenu(false);
  }, [showMybook]);

  const toggleRentalModal = useCallback(() => {
    setOpenRentalInfoModal(!openRentalInfoModal);
    setShowMobileMenu(false);
  }, [openRentalInfoModal]);

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between pb-4 px-4">
        {/* 데스크톱 네비게이션 바 */}
        <div className="hidden lg:block fixed z-20 py-2 bg-cyan-800 bg-opacity-90 backdrop-blur-sm rounded-b-lg shadow-lg">
          <div className="flex w-screen px-4 justify-between items-center gap-4">
            {/* 왼쪽: 로고와 환영 메시지 */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <FaBookBookmark className="text-lg text-white flex-shrink-0" />
              <p className="text-xs text-white truncate">
                {session?.user?.real_name}님, 환영합니다
              </p>
            </div>

            {/* 중앙: 통합 검색 영역 */}
            <div className="flex-1 max-w-md mx-4 search-container relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-sm" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full bg-white/95 border border-cyan-200/50 rounded-lg py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition-all duration-200"
                  placeholder={`${
                    searchType === "title" ? "책 이름" : "저자"
                  } 검색...`}
                  value={searchKey}
                  onChange={handleSearchKeyChange}
                  onFocus={() => setShowSearchDropdown(true)}
                />
                <button
                  onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ⚙️
                </button>
              </div>

              {/* 검색 옵션 드롭다운 */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-30">
                  {/* 검색 타입 선택 */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      검색 타입
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSearchTypeChange("title")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                          searchType === "title"
                            ? "bg-cyan-100 text-cyan-800 shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <FaBook className="text-xs" />책 이름
                      </button>
                      <button
                        onClick={() => handleSearchTypeChange("author")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                          searchType === "author"
                            ? "bg-cyan-100 text-cyan-800 shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <FaUser className="text-xs" />
                        저자
                      </button>
                    </div>
                  </div>

                  {/* 도서번호 검색 */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <FaHashtag className="text-gray-500 text-xs" />
                      <p className="text-xs font-medium text-gray-700">
                        도서 번호
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <BookIDInput
                        id="navBookidInput"
                        onValueChanged={handleManageIdChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 중앙-오른쪽: 내 책 보기 & 대여 현황 버튼 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-colors duration-200 ${
                  showMybook
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-cyan-600/20 text-white hover:bg-cyan-600/40"
                }`}
                onClick={toggleMyBooks}
              >
                <FaEye className="text-xs" />
                <span>{showMybook ? "전체" : "내 책"}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                  {userRentalBooksCount}
                </span>
              </button>
              <button
                className="flex items-center gap-1.5 px-3 h-8 bg-slate-600/80 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                onClick={toggleRentalModal}
              >
                <FaChartBar className="text-xs" />
                대여 현황
              </button>
            </div>

            {/* 오른쪽: 관리자 링크와 로그인 */}
            <div className="flex justify-center items-center gap-4 flex-shrink-0">
              {session?.user?.registered && (
                <Link
                  className="text-white text-xs px-3 py-2 rounded-lg border border-cyan-600 hover:bg-cyan-700 transition-colors duration-200"
                  href={"/profile"}
                >
                  내 정보
                </Link>
              )}
              {session?.user?.admin && (
                <Link
                  className="text-white text-xs px-3 py-2 rounded-lg border border-cyan-600 hover:bg-cyan-700 transition-colors duration-200"
                  href={"/admin"}
                >
                  관리자
                </Link>
              )}
              <SignInButton />
            </div>
          </div>
        </div>

        {/* 모바일 네비게이션 바 */}
        <div className="lg:hidden fixed z-20 w-full bg-cyan-800 bg-opacity-95 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            {/* 왼쪽: 로고 */}
            <div className="flex items-center gap-2">
              <FaBookBookmark className="text-xl text-white" />
              <span className="text-white font-semibold text-sm">
                {session?.user?.real_name}님, 환영합니다
              </span>
            </div>

            {/* 오른쪽: 검색 + 햄버거 메뉴 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileSearch(true)}
                className="p-2 text-white hover:bg-cyan-700 rounded-lg transition-colors duration-200"
              >
                <FaSearch className="text-lg" />
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-white hover:bg-cyan-700 rounded-lg transition-colors duration-200"
              >
                <FaBars className="text-lg" />
              </button>
            </div>
          </div>

          {/* 모바일 드롭다운 메뉴 */}
          {showMobileMenu && (
            <div className="absolute top-full left-0 right-0 bg-cyan-800 border-t border-cyan-600 shadow-lg">
              <div className="px-4 py-3 space-y-3">
                <div className="text-cyan-200 text-xs border-b border-cyan-600 pb-2">
                  {session?.user?.real_name}님, 환영합니다
                </div>

                <button
                  onClick={toggleMyBooks}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    showMybook
                      ? "bg-cyan-600 text-white"
                      : "text-cyan-100 hover:bg-cyan-700"
                  }`}
                >
                  <FaEye className="text-sm" />
                  <span className="flex-1 text-left">
                    {showMybook ? "전체 도서 보기" : "내 책 보기"}
                  </span>
                  <span className="bg-cyan-600 text-white px-2 py-1 rounded-full text-xs">
                    {userRentalBooksCount}
                  </span>
                </button>

                <button
                  onClick={toggleRentalModal}
                  className="w-full flex items-center gap-3 px-3 py-2 text-cyan-100 hover:bg-cyan-700 rounded-lg text-sm transition-colors duration-200"
                >
                  <FaChartBar className="text-sm" />
                  대여 현황
                </button>

                {session?.user?.registered && (
                  <Link
                    href="/profile"
                    className="w-full flex items-center gap-3 px-3 py-2 text-cyan-100 hover:bg-cyan-700 rounded-lg text-sm transition-colors duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FaUser className="text-sm" />내 정보
                  </Link>
                )}

                {session?.user?.admin && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center gap-3 px-3 py-2 text-cyan-100 hover:bg-cyan-700 rounded-lg text-sm transition-colors duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>⚙️</span>
                    관리자 페이지
                  </Link>
                )}

                <div className="pt-2 border-t border-cyan-600">
                  <SignInButton />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 모바일 검색 모달 */}
        {showMobileSearch && (
          <div className="lg:hidden fixed inset-0 z-30">
            {/* 배경 오버레이 */}
            <div
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={closeMobileSearch}
            />

            {/* 검색 패널 */}
            <div className="relative bg-white shadow-lg border-b border-gray-200 animate-slide-down">
              {/* 검색 모달 헤더 */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">
                  도서 검색
                </h2>
                <button
                  onClick={closeMobileSearch}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <FaTimes className="text-gray-600 text-sm" />
                </button>
              </div>

              {/* 검색 내용 */}
              <div className="px-3 py-3 space-y-3">
                {/* 검색 타입 선택 */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    검색 타입
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleSearchTypeChange("title")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        searchType === "title"
                          ? "bg-cyan-100 text-cyan-800 shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FaBook className="text-xs" />책 이름
                    </button>
                    <button
                      onClick={() => handleSearchTypeChange("author")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        searchType === "author"
                          ? "bg-cyan-100 text-cyan-800 shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FaUser className="text-xs" />
                      저자
                    </button>
                  </div>
                </div>

                {/* 키워드 검색 */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                    키워드 검색
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400 text-xs" />
                    </div>
                    <input
                      ref={mobileSearchInputRef}
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-8 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      placeholder={`${
                        searchType === "title" ? "책 이름" : "저자 이름"
                      }을 입력하세요...`}
                      value={searchKey}
                      onChange={handleSearchKeyChange}
                    />
                  </div>
                </div>

                {/* 도서번호 검색 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FaHashtag className="text-gray-500 text-xs" />
                    <p className="text-xs font-medium text-gray-700">
                      도서 번호
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                    <BookIDInput
                      id="mobileBookidInput"
                      onValueChanged={handleManageIdChange}
                    />
                  </div>
                </div>

                {/* 검색 완료 버튼 */}
                <button
                  onClick={closeMobileSearch}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  검색하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex flex-col overflow-auto h-4/5 w-full pt-16 lg:pt-16">
          <BookList
            searchKey={debouncedSearchKey}
            searchType={searchType}
            manageId={debouncedManageId}
            showMybook={showMybook}
            onUserRentalCountUpdate={handleUserRentalCountUpdate}
            onOpenRentalModal={() => setOpenRentalInfoModal(true)}
            openRentalInfoModal={openRentalInfoModal}
            onCloseRentalModal={() => setOpenRentalInfoModal(false)}
          />
        </div>

        {/* 푸터 */}
        <div>
          <p className="text-center text-xs pt-6 text-neutral-400">
            &copy; Ultrasound Korea, GE Healthcare
          </p>
        </div>
      </main>
    </div>
  );
}
