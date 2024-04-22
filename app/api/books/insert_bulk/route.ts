import { NextRequest, NextResponse } from "next/server";
import Book, { IBook } from "@/app/(models)/Book";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    (body as ExcelBulkData).rows.forEach(async (book) => {
      const foundBook = await Book.findOne({ manage_id: book.manage_id });
      if (foundBook) {
        const updateBook = foundBook as IBook;
        updateBook.title = book.title;
        updateBook.author = book.author;
        updateBook.reg_date = book.reg_date;
        updateBook.comments = book.comments;
        updateBook.isMissing = book.isMissing;
        await updateBook.save();
      }
      await Book.create(book);
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
