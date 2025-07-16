import { IBook } from "../(models)/Book";
import {
  BaseSyntheticEvent,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import InfiniteScrollBooks from "./PaginatedBooks";
import RentalInfoModal from "./RentalInfoModal";
import LoadingSpinner from "./LoadingSpinner";

interface BookListProps {
  searchKey: string;
  searchType: "title" | "author";
  manageId: string;
  showMybook: boolean;
  onUserRentalCountUpdate: (count: number) => void;
  onOpenRentalModal: () => void;
  openRentalInfoModal: boolean;
  onCloseRentalModal: () => void;
}

export default function BookList({
  searchKey,
  searchType,
  manageId,
  showMybook,
  onUserRentalCountUpdate,
  onOpenRentalModal,
  openRentalInfoModal,
  onCloseRentalModal,
}: BookListProps) {
  const { data: session } = useSession();
  const [books, setBooks] = useState<IBook[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRentalBooks, setUserRentalBooks] = useState<IBook[]>([]);
  const loadingRef = useRef(false);

  const getBooks = useCallback(async () => {
    // 중복 요청 방지 - ref 사용
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/books");

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: 도서 데이터를 가져오는 데 실패했습니다.`
        );
      }
      const books = (await response.json()) as IBook[];
      setBooks(books);

      if (books && books.length > 0) {
        const userEmails = [
          session?.user?.email,
          session?.user?.company_email,
        ].filter(Boolean);

        const rentalBook = books.filter(
          (book: IBook) =>
            !book.rental_info.rent_available &&
            userEmails.includes(book.rental_info.user_email)
        );
        setUserRentalBooks(rentalBook);
        // 대여 권수를 부모 컴포넌트에 전달
        onUserRentalCountUpdate(rentalBook.length);
      }
    } catch (error) {
      console.error("도서 목록 조회 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [
    session?.user?.email,
    session?.user?.company_email,
    onUserRentalCountUpdate,
  ]);

  useEffect(() => {
    getBooks();
  }, [getBooks]);

  // 필터링된 책 목록 메모이제이션
  const filteredBooks = useMemo(() => {
    if (!books || books.length === 0) return [];

    return books
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
          .localeCompare(a.manage_id.substring(a.manage_id.length - 5))
      );
  }, [books, manageId, searchKey, searchType]);

  // 내 대여 도서 목록 메모이제이션
  const sortedUserRentalBooks = useMemo(() => {
    return userRentalBooks.sort((a, b) =>
      b.manage_id
        .substring(b.manage_id.length - 5)
        .localeCompare(a.manage_id.substring(a.manage_id.length - 5))
    );
  }, [userRentalBooks]);

  return (
    <div>
      {openRentalInfoModal && (
        <RentalInfoModal books={books} toggleModal={onCloseRentalModal} />
      )}

      {isLoading ? (
        <div className="min-h-[400px]">
          <LoadingSpinner message="도서 목록을 불러오는 중..." size="medium" />
        </div>
      ) : error ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              도서 목록을 불러올 수 없습니다
            </h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={getBooks}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : (
        <div>
          {books && books.length > 0 && !showMybook ? (
            <InfiniteScrollBooks
              books={filteredBooks}
              userRentalBooks={userRentalBooks}
              onBookUpdate={getBooks}
            />
          ) : books && books.length > 0 && showMybook ? (
            <InfiniteScrollBooks
              books={sortedUserRentalBooks}
              userRentalBooks={userRentalBooks}
              onBookUpdate={getBooks}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {showMybook
                  ? "대여한 도서가 없습니다."
                  : "검색 결과가 없습니다."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
