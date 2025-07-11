import { IBook } from "../(models)/Book";
import {
  BaseSyntheticEvent,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import PaginatedBooks from "./PaginatedBooks";
import RentalInfoModal from "./RentalInfoModal";
import BookIDInput from "./BookIDInput";
import LoadingSpinner from "./LoadingSpinner";
import {
  FaSearch,
  FaBook,
  FaUser,
  FaHashtag,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function BookList() {
  const { data: session } = useSession();
  const [manageId, setManageId] = useState("");
  const [books, setBooks] = useState<IBook[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [searchType, setSearchType] = useState<"title" | "author">("title");
  const [isLoading, setLoading] = useState(true);
  const [userRentalBooks, setUserRentalBooks] = useState<IBook[]>([]);
  const [showMybook, setShowMybook] = useState(false);
  const [openRentalInfoModal, setOpenRentalInfoModal] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // 검색창 포커스를 위한 ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getBooks = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/books");
    if (!response.ok) {
      throw new Error("도서 데이터를 가져오는 데 실패했습니다.");
    }
    const books = (await response.json()) as IBook[];
    setBooks(books);
    setLoading(false);
    if (books && books.length > 0) {
      const rentalBook = books.filter(
        (book: IBook) =>
          !book.rental_info.rent_available &&
          book.rental_info.user_email === session?.user?.email
      );
      setUserRentalBooks(rentalBook);
    }
  }, [session?.user?.email]); // 의존성 배열 추가

  useEffect(() => {
    getBooks();
  }, [getBooks]);

  // 검색창이 펼쳐질 때 포커스 주기
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      // 애니메이션 완료 후 포커스
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [isSearchExpanded]);

  function searchById(bookid: string) {
    setManageId(bookid);
  }

  function searchByKeyword(e: BaseSyntheticEvent) {
    setSearchKey(e.target.value);
  }

  function handleSearchTypeChange(type: "title" | "author") {
    setSearchType(type);
    setSearchKey(""); // 검색 타입 변경 시 검색어 초기화
  }

  return (
    <div>
      {openRentalInfoModal && (
        <RentalInfoModal
          books={books}
          toggleModal={() => setOpenRentalInfoModal(false)}
        />
      )}
      <div className="max-w-sm rounded-xl overflow-hidden shadow-lg border border-cyan-200/30 bg-gradient-to-br from-cyan-800 to-cyan-900 backdrop-blur-sm mb-4">
        {/* 항상 보이는 헤더 부분 */}
        <div
          className="px-4 py-3 cursor-pointer hover:bg-cyan-700/20 transition-all duration-200"
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <FaSearch className="text-cyan-200 text-sm" />
              <p className="font-semibold text-white text-sm">도서 검색</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-cyan-200 text-xs bg-cyan-700/50 rounded-full px-2 py-0.5">
                {userRentalBooks.length}/3권
              </p>
              {isSearchExpanded ? (
                <FaChevronUp className="text-cyan-200 text-xs" />
              ) : (
                <FaChevronDown className="text-cyan-200 text-xs" />
              )}
            </div>
          </div>

          {/* 접힌 상태에서 보이는 간단한 검색창 */}
          {!isSearchExpanded && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-xs" />
                </div>
                <input
                  type="text"
                  className="w-full bg-white/95 border border-cyan-200/50 rounded-lg py-2 pl-8 pr-3 text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-300 focus:border-transparent transition-all duration-200"
                  placeholder="책 이름 또는 저자 검색..."
                  value={searchKey}
                  onChange={searchByKeyword}
                  onClick={() => setIsSearchExpanded(true)}
                />
              </div>
            </div>
          )}
        </div>

        {/* 펼쳐졌을 때만 보이는 상세 검색 옵션들 */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSearchExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-3 border-t border-cyan-600/30">
            {/* 내 책 보기 & 대여정보 버튼들 */}
            <div className="flex gap-1.5 mb-3 mt-3">
              <div
                className={`flex-1 text-center text-xs py-1.5 px-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  showMybook
                    ? "bg-red-500/80 text-white shadow-md"
                    : "bg-cyan-600/40 text-cyan-100 hover:bg-cyan-600/60"
                }`}
                onClick={() => setShowMybook(!showMybook)}
              >
                내 책 보기
              </div>
              <div
                className="flex-1 text-center text-xs py-1.5 px-2 rounded-lg bg-cyan-600/40 text-cyan-100 hover:bg-cyan-600/60 transition-all duration-200 cursor-pointer"
                onClick={() => setOpenRentalInfoModal(true)}
              >
                대여정보
              </div>
            </div>

            {/* 도서번호 검색 */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FaHashtag className="text-cyan-300 text-xs" />
                <p className="text-xs font-medium text-cyan-100">도서 번호</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-cyan-300/20">
                <BookIDInput id="bookidInput" onValueChanged={searchById} />
              </div>
            </div>

            {/* 키워드 검색 */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FaSearch className="text-cyan-300 text-xs" />
                <p className="text-xs font-medium text-cyan-100">키워드 검색</p>
              </div>

              {/* 검색 타입 선택 */}
              <div className="flex gap-1.5 mb-2">
                <button
                  onClick={() => handleSearchTypeChange("title")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                    searchType === "title"
                      ? "bg-white text-cyan-800 shadow-sm"
                      : "bg-cyan-600/40 text-cyan-100 hover:bg-cyan-600/60"
                  }`}
                >
                  <FaBook className="text-xs" />책 이름
                </button>
                <button
                  onClick={() => handleSearchTypeChange("author")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                    searchType === "author"
                      ? "bg-white text-cyan-800 shadow-sm"
                      : "bg-cyan-600/40 text-cyan-100 hover:bg-cyan-600/60"
                  }`}
                >
                  <FaUser className="text-xs" />
                  저자
                </button>
              </div>

              {/* 검색 입력창 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-xs" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full bg-white/95 border border-cyan-200/50 rounded-lg py-2 pl-8 pr-3 text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-300 focus:border-transparent transition-all duration-200"
                  placeholder={
                    searchType === "title"
                      ? "책 이름 검색..."
                      : "저자 이름 검색..."
                  }
                  value={searchKey}
                  onChange={searchByKeyword}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[400px]">
          <LoadingSpinner message="도서 목록을 불러오는 중..." size="medium" />
        </div>
      ) : (
        <div>
          {books && books.length > 0 && !showMybook ? (
            <PaginatedBooks
              books={books
                .filter((book) => {
                  const matchesId = book.manage_id.includes(manageId);
                  const matchesKeyword =
                    searchType === "title"
                      ? book.title.includes(searchKey)
                      : book.author.includes(searchKey);
                  return matchesId && matchesKeyword;
                })
                .sort((a, b) =>
                  b.manage_id
                    .substring(b.manage_id.length - 5)
                    .localeCompare(
                      a.manage_id.substring(a.manage_id.length - 5)
                    )
                )}
              userRentalBooks={userRentalBooks}
              onBookUpdate={getBooks}
            />
          ) : books && books.length > 0 && showMybook ? (
            <PaginatedBooks
              books={userRentalBooks.sort((a, b) =>
                b.manage_id
                  .substring(b.manage_id.length - 5)
                  .localeCompare(a.manage_id.substring(a.manage_id.length - 5))
              )}
              userRentalBooks={userRentalBooks}
              onBookUpdate={getBooks}
            />
          ) : (
            <div>ServerError</div>
          )}
        </div>
      )}
    </div>
  );
}
