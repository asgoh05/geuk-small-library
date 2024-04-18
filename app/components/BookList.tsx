import { IBook } from "../(models)/Book";
import BookCard from "./BookCard";
import FourDigitInput from "./FourDigitInput";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PaginatedBooks from "./PaginatedBooks";

export default function BookList() {
  const { data: session } = useSession();
  const [filteredBooks, setFilteredBooks] = useState<IBook[]>([]);
  const [books, setBooks] = useState<IBook[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [userRentalBook, setUserRentalBook] = useState<IBook | null>(null);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((books: IBook[]) => {
        setBooks(books);
        setLoading(false);

        const rentalBook = books.find(
          (book: IBook) =>
            !book.rental_info.rent_available &&
            book.rental_info.user_email === session?.user?.email
        );
        setUserRentalBook(rentalBook ?? null);
      });
  }, [books, session]);

  function searchById(bookid: string) {
    const manage_id = `GEUK_BOOK_${bookid}`;
    setFilteredBooks(
      books.filter((book) => book.manage_id.includes(manage_id))
    );
    setSearchKey("");
  }

  function searchByKeyword(e: BaseSyntheticEvent) {
    e.preventDefault();
    setSearchKey(e.target.value);
    setFilteredBooks(
      books.filter((book) => book.title.includes(e.target.value))
    );
  }
  return (
    <div>
      {userRentalBook == null ? (
        ""
      ) : (
        <div>
          <p className="text-xs absolute rounded-e-full bg-red-600 text-white px-1">
            대여중
          </p>
          <BookCard
            book={userRentalBook}
            hasRentalBook={userRentalBook != null}
          />
        </div>
      )}
      <div className="flex items-center justify-start py-2">
        <p className="text-sm">도서 번호: &nbsp;</p>
        <p className="text-neutral-500 text-sm align-bottom pr-1">GEUK_BOOK_</p>
        <FourDigitInput id="fourDigitInput" onValueChanged={searchById} />
      </div>
      <div className="flex items-center justify-start pb-2">
        <p className="text-sm">책이름 검색: &nbsp;</p>
        <input
          type="text"
          className="w-auto border border-neutral-200 rounded indent-1"
          value={searchKey}
          onChange={searchByKeyword}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col h-screen justify-center pb-30">
          <p className="text-center h-1/2">Loading...</p>
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
          <PaginatedBooks
            books={filteredBooks.length === 0 ? books : filteredBooks}
            userRentalBook={userRentalBook}
          />
        </div>
      )}
    </div>
  );
}
