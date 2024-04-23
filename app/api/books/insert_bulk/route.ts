import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";

interface InsertBook {
  manage_id: String;
  title: String;
  author: String;
  reg_date: Date;
  comments: String;
}

async function DeleteIfNotExistInExcel(excel_books: Array<InsertBook>) {
  const dbBooks = await Book.find();
  dbBooks.filter(async (dbBook) => {
    if (
      excel_books.map((x) => x.manage_id).includes(dbBook.manage_id) === false
    ) {
      await Book.deleteOne({ manage_id: dbBook.manage_id });
    }
  });
}

async function AddorUpdatebyExcel(excel_books: Array<InsertBook>) {
  excel_books.forEach(async (book) => {
    const exist = await Book.findOne({ manage_id: book.manage_id });

    if (exist === null) {
      const insertData = {
        manage_id: book.manage_id,
        title: book.title,
        author: book.author,
        img_url: "",
        reg_date: book.reg_date,
        comments: book.comments,
        rental_info: {
          rent_available: true,
          rent_date: null,
          return_date: null,
          user_name: "",
          user_email: "",
        },
      };
      await Book.create(insertData);
    } else {
      exist.manage_id = book.manage_id;
      exist.title = book.title;
      exist.author = book.author;
      exist.reg_date = book.reg_date;
      exist.comments = book.comments;
      await exist.save();
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const books = body as Array<InsertBook>;

    await Promise.all([
      DeleteIfNotExistInExcel(books),
      AddorUpdatebyExcel(books),
    ]);

    return NextResponse.json({ message: `All Books Updated` }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
