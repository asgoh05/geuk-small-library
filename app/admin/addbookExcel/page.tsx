"use client";
import { BaseSyntheticEvent, useState, useRef } from "react";
import readXlsxFile, { ParsedObjectsResult } from "read-excel-file";
import { IBook } from "@/app/(models)/Book";

export default function AddBookExcelPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const readFile = async (e: BaseSyntheticEvent) => {
    const { files } = e.target;

    setLoading(true);
    setMessage("");

    if (files !== null) {
      try {
        const rows = await readXlsxFile(files[0], {
          schema,
          sheet: "GEUK 도서 리스트",
        });
        if (rows.errors.length > 0) {
          setMessage(rows.errors.join(","));
          return;
        }

        const res = await fetch("/api/books/insert_bulk", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(rows.rows),
        });

        const result = await res.json();
        setMessage(result.message);
      } catch (err) {
        setMessage(`Error: ${err}`);
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } else {
      setMessage("file not found");
    }
  };

  return (
    <div className="pt-8">
      <input ref={fileRef} type="file" onChange={readFile} />
      <p className="text-red-700 text-xs">{message}</p>
      {isLoading ? "Loading..." : ""}
    </div>
  );
}

const schema = {
  "No.": {
    // JSON object property name.
    prop: "manage_id",
    type: String,
    required: true,
  },
  Title: {
    prop: "title",
    type: String,
    required: true,
  },
  Author: {
    prop: "author",
    type: String,
    required: true,
  },
  "Released Date": {
    prop: "reg_date",
    type: Date,
  },
  Note: {
    prop: "comment",
    type: String,
  },
};
