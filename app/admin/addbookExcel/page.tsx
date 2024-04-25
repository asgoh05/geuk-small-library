"use client";
import { BaseSyntheticEvent, useState, useRef, useEffect } from "react";
import readXlsxFile, { ParsedObjectsResult } from "read-excel-file";
import { IBook, IBookInternal } from "@/app/(models)/Book";
import { IsSameDate, getDateString } from "@/app/(general)/datetime";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

export default function AddBookExcelPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [books, setBooks] = useState<IBook[]>([]);
  const [booksToCreate, setbooksToCreate] = useState<IBookInternal[]>([]);
  const [booksToUpdate, setbooksToUpdate] = useState<IBookInternal[]>([]);
  const [booksToDelete, setbooksToDelete] = useState<IBook[]>([]);
  const [file, setFile] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((books: IBook[]) => {
        setBooks(books);
        setLoading(false);
      });
  }, [books]);

  async function readFile(e: BaseSyntheticEvent) {
    const { files } = e.target;

    setLoading(true);
    setMessage("");

    const rows = await readXlsxFile(files[0], {
      schema,
      sheet: "GEUK 도서 리스트",
    });
    if (rows.errors.length > 0) {
      setMessage(rows.errors.join(","));
      return;
    }
    validateExcelData(rows.rows as IRow[]);
  }

  function validateExcelData(rows: IRow[]) {
    // create new
    const tobeCreated: Array<IBookInternal> = [];
    const idlist_db = books.map((book) => book.manage_id);
    rows.forEach((row) => {
      if (idlist_db.includes(row.manage_id) === false) {
        const newBook: IBookInternal = {
          manage_id: row.manage_id,
          title: row.title,
          author: row.author,
          img_url: "",
          reg_date: row.reg_date,
          comments: row.comments ?? "",
          rental_info: {
            rent_available: true,
            rent_date: null,
            return_date: null,
            expected_return_date: null,
            user_name: "",
            user_email: "",
          },
        };
        tobeCreated.push(newBook);
      }
    });

    setbooksToCreate(tobeCreated);

    // updated data
    const tobeUpdated: Array<IBookInternal> = [];
    rows.forEach((row) => {
      const idx = books.findIndex((book) => book.manage_id === row.manage_id);
      if (idx > -1)
        if (
          books[idx].title !== row.title ||
          books[idx].author !== row.author ||
          !IsSameDate(new Date(books[idx].reg_date), new Date(row.reg_date)) ||
          books[idx].comments !== (row.comments ?? "")
        ) {
          const updateBook: IBookInternal = {
            manage_id: row.manage_id,
            title: row.title,
            author: row.author,
            img_url: "",
            reg_date: row.reg_date,
            comments: row.comments ?? "",
            rental_info: {
              rent_available: books[idx].rental_info.rent_available,
              rent_date: books[idx].rental_info.rent_date,
              return_date: books[idx].rental_info.return_date,
              expected_return_date: books[idx].rental_info.expected_return_date,
              user_name: books[idx].rental_info.user_name,
              user_email: books[idx].rental_info.user_email,
            },
          };
          tobeUpdated.push(updateBook);
        }
    });
    setbooksToUpdate(tobeUpdated);

    // delete data
    const tebeDeleted: Array<IBook> = [];
    const idlist_excel = rows.map((row) => row.manage_id);
    books.forEach((book) => {
      if (!idlist_excel.includes(book.manage_id)) {
        tebeDeleted.push(book);
      }
    });
    setbooksToDelete(tebeDeleted);
  }

  const columns: GridColDef<IBookGrid>[] = [
    { field: "id", headerName: "ID", width: 160 },
    {
      field: "title",
      headerName: "Book Title",
      width: 150,
    },
    {
      field: "author",
      headerName: "Author",
      width: 150,
    },
    {
      field: "reg_date",
      headerName: "Released Date",
      width: 150,
    },
    {
      field: "comments",
      headerName: "Note",
      align: "center",
      width: 200,
    },
  ];

  async function startFetch() {
    setLoading(true);
    if (booksToCreate.length > 0) {
      const res = await fetch("/api/books/many", {
        method: "POST",
        body: JSON.stringify(booksToCreate),
      });

      if (res.status === 200 || res.status === 201) {
        setMessage(`Created Books ${booksToCreate.length}`);
        setTimeout(() => setMessage(""), 5000);
      } else {
        const message = await res.json();
        setMessage(message.err.message);
        setTimeout(() => setMessage(""), 5000);
      }
    }
    if (booksToUpdate.length > 0) {
      const res = await fetch("/api/books/many", {
        method: "PUT",
        body: JSON.stringify(booksToUpdate),
      });

      if (res.status === 200 || res.status === 201) {
        setMessage(`Updated Books ${booksToUpdate.length}`);
        setTimeout(() => setMessage(""), 5000);
      } else {
        const message = await res.json();
        setMessage(message.err.message);
        setTimeout(() => setMessage(""), 5000);
      }
    }
    if (booksToDelete.length > 0) {
      const res = await fetch("/api/books/many", {
        method: "DELETE",
        body: JSON.stringify(booksToDelete),
      });

      if (res.status === 200 || res.status === 201) {
        setMessage(`Deleted Books ${booksToDelete.length}`);
        setTimeout(() => setMessage(""), 5000);
      } else {
        const message = await res.json();
        setMessage(message.err.message);
        setTimeout(() => setMessage(""), 5000);
      }
    }
    setbooksToCreate([]);
    setbooksToUpdate([]);
    setbooksToDelete([]);
  }

  return (
    <div className="pt-16">
      <h1 className="p-4 text-center">도서 추가하기 EXCEL</h1>
      <input
        className="pb-12 text-center"
        ref={fileRef}
        type="file"
        onChange={readFile}
        value={file}
        onClick={() => setFile("")}
      />
      <p className="text-red-700 text-xs">{message}</p>
      {isLoading ? "Loading..." : ""}

      <div className="flex flex-col items-center justify-center p-4">
        {booksToCreate.length > 0 ||
        booksToUpdate.length > 0 ||
        booksToDelete.length > 0 ? (
          <button
            className="bg-red-200 px-2 py-1 rounded-full hover:bg-red-50"
            onClick={startFetch}
          >
            업데이트 반영하기
          </button>
        ) : (
          "업데이트 할 내용이 없습니다"
        )}
      </div>

      {booksToCreate.length > 0 ? (
        <div>
          <h1>Books to be Created: ({booksToCreate.length})</h1>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={booksToCreate.map((x) => {
                return {
                  id: x.manage_id,
                  title: x.title,
                  author: x.author,
                  reg_date: getDateString(x.reg_date),
                  comments: x.comments,
                };
              })}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </div>
      ) : (
        ""
      )}
      {booksToUpdate.length > 0 ? (
        <div>
          <h1>To be Updated: ({booksToUpdate.length})</h1>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={booksToUpdate.map((x) => {
                return {
                  id: x.manage_id,
                  title: x.title,
                  author: x.author,
                  reg_date: getDateString(x.reg_date),
                  comments: x.comments,
                };
              })}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </div>
      ) : (
        ""
      )}
      {booksToDelete.length > 0 ? (
        <div>
          <h1>To be Deleted: ({booksToDelete.length})</h1>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={booksToDelete.map((x) => {
                return {
                  id: x.manage_id,
                  title: x.title,
                  author: x.author,
                  reg_date: getDateString(x.reg_date),
                  comments: x.comments,
                };
              })}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

interface IBookGrid {
  id: string;
  title: string;
  author: string;
  reg_date: string;
  comments: string;
}

interface IRow {
  manage_id: string;
  title: string;
  author: string;
  reg_date: Date;
  comments?: string;
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
    prop: "comments",
    type: String,
    default: "",
  },
};
