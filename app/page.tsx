import Image from "next/image";
import { IBook } from "./(models)/Book";
import MainPage from "./components/MainPage";

export default async function Home() {
  const books: IBook[] = await fetchBooks();
  return (
    <div>
      <MainPage books={books} />
    </div>
  );
}

export async function fetchBooks() {
  const res = await fetch(`${process.env.HOME_URL}/api/books`, {
    cache: "no-store",
  });
  const books = await res.json();
  return books;
}
