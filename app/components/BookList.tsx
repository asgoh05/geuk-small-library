import { useSession } from "next-auth/react";
import { IBook } from "../(models)/Book";
import BookCard from "./BookCard";
import FourDigitInput from "./FourDigitInput";
import { BaseSyntheticEvent, useState } from "react";

interface BookListProps {
  books: IBook[];
}

export default function BookList({ books }: BookListProps) {
  const { data: session } = useSession();
  const [filteredBooks, setFilteredBooks] = useState<IBook[]>(books);
  const [searchKey, setSearchKey] = useState("");

  function searchById(bookid: string) {
    if (bookid === "") {
      setFilteredBooks(books);
      return;
    }
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
      <div className="flex items-center justify-start py-2">
        <p className="text-sm">도서번호로 검색: &nbsp;</p>
        <p className="text-neutral-500 text-sm align-bottom pr-1">GEUK_BOOK_</p>
        <FourDigitInput id="fourDigitInput" onValueChanged={searchById} />
      </div>
      <div className="flex items-center justify-start pb-2">
        <p className="text-sm">책이름으로 검색: &nbsp;</p>
        <input
          type="text"
          className="w-auto border border-neutral-200 rounded indent-1"
          value={searchKey}
          onChange={searchByKeyword}
        />
      </div>

      <ul>
        {filteredBooks.map((book) => {
          return (
            <li key={book._id}>
              <BookCard book={book} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
