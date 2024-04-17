import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";

export async function GET() {
  try {
    const books = await Book.find();
    return NextResponse.json(books);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await Book.create(body);

    return NextResponse.json({ message: "Book Created" }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
