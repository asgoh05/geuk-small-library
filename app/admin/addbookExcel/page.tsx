"use client";
import { BaseSyntheticEvent, useState, useRef } from "react";
import readXlsxFile from "read-excel-file";

export default function AddBookExcelPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = (e: BaseSyntheticEvent) => {
    const fileReader = new FileReader();
    const { files } = e.target;

    if (files !== null) {
      readXlsxFile(files[0], { schema, sheet: "mySheet" }).then((rows) => {
        fetch("/api/books/insert_bulk", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(rows),
        });
      });
    } else {
    }
  };

  return (
    <div className="pt-8">
      <input ref={fileRef} type="file" onChange={readFile} />
    </div>
  );
}

const schema = {
  "no.": {
    // JSON object property name.
    prop: "manage_id",
    type: String,
    required: true,
  },
  title: {
    prop: "title",
    type: String,
    required: true,
  },
  author: {
    prop: "author",
    type: String,
    required: true,
  },
  등록일: {
    prop: "reg_date",
    type: Date,
  },
  comment: {
    prop: "comment",
    type: String,
  },
};
