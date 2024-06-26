"use client";
import { IBook } from "../(models)/Book";
import BookCard from "./BookCard";
import { useEffect, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";

interface PaginatedBooksProps {
  books: IBook[];
  userRentalBooks: IBook[];
}

export default function PaginatedBooks({
  books,
  userRentalBooks,
}: PaginatedBooksProps) {
  const [curPage, setCurPage] = useState(1);

  const itemsPerPage = 12;
  const pageCount =
    Math.ceil(books.length / itemsPerPage) === 0
      ? 1
      : Math.ceil(books.length / itemsPerPage);

  if (curPage > pageCount) setCurPage(pageCount);

  return (
    <>
      {/* <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 items-center"> */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {books
          .slice(
            (curPage - 1) * itemsPerPage,
            (curPage - 1) * itemsPerPage + itemsPerPage
          )
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
