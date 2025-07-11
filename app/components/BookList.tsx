import { IBook } from "../(models)/Book";
import {
  BaseSyntheticEvent,
  useCallback,
  useEffect,
  useState,
  useRef,
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
  const [userRentalBooks, setUserRentalBooks] = useState<IBook[]>([]);

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
      // 대여 권수를 부모 컴포넌트에 전달
      onUserRentalCountUpdate(rentalBook.length);
    }
  }, [session?.user?.email, onUserRentalCountUpdate]);

  useEffect(() => {
    getBooks();
  }, [getBooks]);

  return (
    <div>
      {openRentalInfoModal && (
        <RentalInfoModal books={books} toggleModal={onCloseRentalModal} />
      )}

      {isLoading ? (
        <div className="min-h-[400px]">
          <LoadingSpinner message="도서 목록을 불러오는 중..." size="medium" />
        </div>
      ) : (
        <div>
          {books && books.length > 0 && !showMybook ? (
            <InfiniteScrollBooks
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
            <InfiniteScrollBooks
              books={userRentalBooks.sort((a, b) =>
                b.manage_id
                  .substring(b.manage_id.length - 5)
                  .localeCompare(a.manage_id.substring(a.manage_id.length - 5))
              )}
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
