import { NextRequest, NextResponse } from "next/server";
import Book, { IBook } from "@/app/(models)/Book";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    (body as ExcelBulkData).rows.forEach(async (book) => {
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
