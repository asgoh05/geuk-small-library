"use client";
import { BaseSyntheticEvent, useState, useRef } from "react";
import readXlsxFile from "read-excel-file";

export default function AddBookExcelPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const readFile = (e: BaseSyntheticEvent) => {
    const { files } = e.target;

    if (files !== null) {
      readXlsxFile(files[0], { schema, sheet: "GEUK 도서 리스트" })
        .then((rows) => {
          fetch("/api/books/insert_bulk", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify(rows),
          });
        })
        .catch((err) => setMessage(err.message));
    } else {
      setMessage("file not found");
    }
  };

  return (
    <div className="pt-8">
      <input ref={fileRef} type="file" onChange={readFile} />
      <p className="text-red-700 text-xs">{message}</p>
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
  분실여부: {
    prop: "isMissing",
    type: String,
  },
};
