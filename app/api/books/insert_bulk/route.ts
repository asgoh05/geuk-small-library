import { NextRequest, NextResponse } from "next/server";
import Book, { IBook } from "@/app/(models)/Book";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    (body as ExcelBulkData).rows.forEach(async (book) => {
      const foundBook = await Book.findOne({ manage_id: book.manage_id });
      console.log(foundBook);
      if (foundBook) {
        const updateBook = foundBook as IBook;
        updateBook.title = book.title;
        updateBook.author = book.author;
        updateBook.reg_date = book.reg_date;
        updateBook.comments = book.comments;
        await updateBook.save();
      } else {
        await Book.create({
          manage_id: book.manage_id,
          title: book.title,
          author: book.author,
          img_url: "",
          reg_date: book.reg_date,
          comments: book.comments,
          rental_info: {
            rent_available: true,
            rent_date: null,
            expected_return_date: null,
            return_date: null,
            user_name: "",
            user_email: "",
          },
        });
      }
    });

    return NextResponse.json({ message: "All Books Created" }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}

interface ExcelBulkData {
  rows: Array<IBook>;
  errors: Array<String>;
}
