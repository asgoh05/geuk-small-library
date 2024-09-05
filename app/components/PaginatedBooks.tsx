"use client";
import { IBook } from "../(models)/Book";
import BookCard from "./BookCard";
import { useEffect, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";

interface PaginatedBooksProps {
  books: IBook[];
  userRentalBooks: IBook[];
  onBookUpdate: () => void;
}

export default function PaginatedBooks({
  books,
  userRentalBooks,
  onBookUpdate,
}: PaginatedBooksProps) {
  const [curPage, setCurPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 1500 ? 30 : 12);
    };

    handleResize(); // 초기 설정
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const pageCount = Math.ceil(books.length / itemsPerPage) || 1;

  if (curPage > pageCount) setCurPage(pageCount);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {books
          .slice((curPage - 1) * itemsPerPage, curPage * itemsPerPage)
          .map((book) => {
            return (
              <div key={book._id}>
                <BookCard
                  book={book}
                  isMyBook={
                    userRentalBooks.find(
                      (mybook) => mybook.manage_id === book.manage_id
                    ) !== undefined
                  }
                  noRentBook={userRentalBooks.length}
                  onBookUpdate={onBookUpdate}
                />
              </div>
            );
          })}
      </div>
      <div className="flex justify-center pt-8 items-center gap-3">
        {curPage > 1 ? (
          <CiCircleChevLeft
            className="text-3xl text-white hover:text-blue-500 cursor-pointer"
            onClick={() => {
              if (curPage > 1) {
                setCurPage((prev) => curPage - 1);
              }
            }}
          />
        ) : (
          <CiCircleChevLeft className="text-3xl text-white" />
        )}

        <p className="text-sm text-white">
          {curPage} / {pageCount}
        </p>
        {curPage < pageCount ? (
          <CiCircleChevRight
            className="text-3xl text-white hover:text-blue-500 cursor-pointer"
            onClick={() => {
              if (curPage < pageCount) setCurPage((prev) => curPage + 1);
            }}
          />
        ) : (
          <CiCircleChevRight className="text-3xl text-white" />
        )}
      </div>
    </>
  );
}
