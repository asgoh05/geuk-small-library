"use client";
import { getDateString } from "@/app/(general)/datetime";
import { IBookInternal } from "@/app/(models)/Book";
import { useEffect, useRef, useState } from "react";
import writeXlsxFile from "write-excel-file";

export default function ExportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState("");
  const [books, setBooks] = useState<IBookInternal[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((books: IBookInternal[]) => {
        setBooks(books);
      })
      .finally(() => setLoading(false));
  }, [books]);

  const today = new Date(Date.now());
  const fileName = `GEUK_Library_downloaded_${getDateString(today)}`;

  async function downloadFile() {
    await writeXlsxFile(books, {
      schema,
      fileName: fileName,
    });
  }

  return (
    <div className="flex flex-col justify-center items-center p-16">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1 className="p-4 text-center">Export to Excel</h1>
          <button
            className="px-2 py-1 border rounded-xl bg-slate-500 text-white hover:bg-slate-400"
            onClick={downloadFile}
          >
            Download as Excel File
          </button>
        </div>
      )}
    </div>
  );
}

const schema = [
  {
    column: "Manage ID",
    type: String,
    value: (book: IBookInternal) => book.manage_id,
  },
  {
    column: "Title",
    type: String,
    value: (book: IBookInternal) => book.title,
  },
  {
    column: "Author",
    type: String,
    value: (book: IBookInternal) => book.author,
  },
  {
    column: "reg_date",
    type: Date,
    format: "yyyy-mm-dd",
    value: (book: IBookInternal) => new Date(book.reg_date),
  },
  {
    column: "Note",
    type: String,
    value: (book: IBookInternal) => book.comments,
  },
  {
    column: "대여중",
    type: String,
    value: (book: IBookInternal) =>
      book.rental_info.rent_available ? "" : "대여중",
  },
  {
    column: "최근이용자",
    type: String,
    value: (book: IBookInternal) => book.rental_info.user_name,
  },
  {
    column: "최근이용자(이메일)",
    type: String,
    value: (book: IBookInternal) => book.rental_info.user_email,
  },
  {
    column: "대여일",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) =>
      book.rental_info.rent_date ? new Date(book.rental_info.rent_date) : null,
  },
  {
    column: "반납예정일",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) =>
      book.rental_info.expected_return_date
        ? new Date(book.rental_info.expected_return_date)
        : null,
  },
  {
    column: "반납일",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) =>
      book.rental_info.return_date
        ? new Date(book.rental_info.return_date)
        : null,
  },
];
