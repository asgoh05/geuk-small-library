"use client";
import Image from "next/image";
import Book, { IBook } from "./(models)/Book";
import MainPage from "./components/MainPage";
import { useEffect, useState } from "react";

export default function Home() {
  // const books: IBook[] = await fetchBooks();
  const [books, setBooks] = useState<IBook[]>([]);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));
  }, []);
  return (
    <div>
      <MainPage books={books} />
    </div>
  );
}

// async function fetchBooks() {
//   const res = await fetch(`${process.env.HOME_URL}/api/books`, {
//     cache: "no-store",
//   });

//   const books = await res.json();
//   return books;
// }
