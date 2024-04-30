import { IBook } from "../(models)/Book";
import FourDigitInput from "./FourDigitInput";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PaginatedBooks from "./PaginatedBooks";
import RentalInfoModal from "./RentalInfoModal";
import BookIDInput from "./BookIDInput";

export default function BookList() {
  const { data: session } = useSession();
  // const [filteredBooks, setFilteredBooks] = useState<IBook[]>([]);
  const [manageId, setManageId] = useState("");
  const [books, setBooks] = useState<IBook[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [userRentalBooks, setUserRentalBooks] = useState<IBook[]>([]);
  const [showMybook, setShowMybook] = useState(false);
  const [openRentalInfoModal, setOpenRentalInfoModal] = useState(false);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((books: IBook[]) => {
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
      });
  }, [books, session]);

  function searchById(bookid: string) {
    setManageId(bookid);
    // setFilteredBooks(
    //   books.filter((book) => book.manage_id.includes(`GEUK_BOOK_${bookid}`))
    // );
    // setSearchKey("");
  }

  function searchByKeyword(e: BaseSyntheticEvent) {
    // e.preventDefault();
    setSearchKey(e.target.value);
    // setFilteredBooks(
    //   books.filter((book) => book.title.includes(e.target.value))
    // );
  }
  return (
    <div>
      {openRentalInfoModal && (
        <RentalInfoModal
          books={books}
          toggleModal={() => setOpenRentalInfoModal(false)}
        />
      )}
      <div className="max-w-sm rounded-lg overflow-hidden shadow-md border gap-2 bg-cyan-800 bg-opacity-90 mb-4">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center gap-2">
            <p className="font-bold mb-2 max-w-60 text-white">도서 검색</p>
            <p className="relative bottom-8 text-gray-300 align-middle text-xs">
              {userRentalBooks.length}/3권 대여중
            </p>
            <div>
              {showMybook ? (
                <div
                  className="text-red-600 bg-cyan-600 text-xs mb-2 rounded-full border py-1 px-2 shadow-md hover:bg-cyan-900 cursor-pointer text-center"
                  onClick={() => setShowMybook(!showMybook)}
                >
                  내 책 보기
                </div>
              ) : (
                <div
                  className="text-white text-xs mb-2 rounded-full border py-1 px-2 shadow-md hover:bg-cyan-900 cursor-pointer text-center"
                  onClick={() => setShowMybook(!showMybook)}
                >
                  내 책 보기
                </div>
              )}
              <div
                className="text-white text-xs mb-2 rounded-full border py-1 px-2 shadow-md hover:bg-cyan-900 cursor-pointer"
                onClick={() => setOpenRentalInfoModal(true)}
              >
                모든 대여정보
              </div>
            </div>
          </div>
          <div className="flex items-center py-2 w-full flex-nowrap">
            <p className="text-sm min-w-24 text-white">도서 번호:</p>
            <BookIDInput id="bookidInput" onValueChanged={searchById} />
          </div>
          <div className="flex items-center justify-start pb-2">
            <p className="text-sm min-w-24 text-white">책 이름:</p>
            <input
              type="text"
              className="w-full border border-neutral-200 rounded indent-1 bg-white"
              value={searchKey}
              onChange={searchByKeyword}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col h-screen justify-center pb-30">
          <p className="text-center h-1/2 text-white">Loading...</p>
        </div>
      ) : (
        <div>
          {/* {filteredBooks.map((book) => {
            return (
              <div key={book._id} className="max-w-sm w-full m-1">
                <BookCard book={book} hasRentalBook={userRentalBook !== null} />
              </div>
            );
          })} */}
          {books && books.length > 0 && !showMybook ? (
            <PaginatedBooks
              books={books
                .filter(
                  (book) =>
                    book.manage_id.includes(manageId) &&
                    book.title.includes(searchKey)
                )
                .sort((a, b) =>
                  b.manage_id
                    .substring(b.manage_id.length - 5)
                    .localeCompare(
                      a.manage_id.substring(a.manage_id.length - 5)
                    )
                )}
              userRentalBooks={userRentalBooks}
            />
          ) : books && books.length > 0 && showMybook ? (
            <PaginatedBooks
              books={userRentalBooks.sort((a, b) =>
                b.manage_id
                  .substring(b.manage_id.length - 5)
                  .localeCompare(a.manage_id.substring(a.manage_id.length - 5))
              )}
              userRentalBooks={userRentalBooks}
            />
          ) : (
            <div>ServerError</div>
          )}
        </div>
      )}
    </div>
  );
}
