"use client";
import { IBook } from "../(models)/Book";
import BookCard from "./BookCard";
import { useEffect, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";

interface PaginatedBooksProps {
  books: IBook[];
  userRentalBook: IBook | null;
}

export default function PaginatedBooks({
  books,
  userRentalBook,
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
      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 items-center">
        {books
          .slice(
            (curPage - 1) * itemsPerPage,
            (curPage - 1) * itemsPerPage + itemsPerPage
          )
          .map((book) => {
            return (
              <div key={book._id} className="max-w-sm w-full m-1">
                <BookCard book={book} hasRentalBook={userRentalBook !== null} />
              </div>
            );
          })}
      </div>
      <div className="flex justify-center pt-8 items-center gap-3">
        {curPage > 1 ? (
          <CiCircleChevLeft
            className="text-3xl hover:text-blue-500 cursor-pointer"
            onClick={() => {
              if (curPage > 1) {
                setCurPage((prev) => curPage - 1);
              }
            }}
          />
        ) : (
          <CiCircleChevLeft className="text-3xl text-neutral-200" />
        )}

        <p className="text-sm">
          {curPage} / {pageCount}
        </p>
        {curPage < pageCount ? (
          <CiCircleChevRight
            className="text-3xl hover:text-blue-500 cursor-pointer"
            onClick={() => {
              if (curPage < pageCount) setCurPage((prev) => curPage + 1);
            }}
          />
        ) : (
          <CiCircleChevRight className="text-3xl text-neutral-200" />
        )}
      </div>
    </>
  );
}
