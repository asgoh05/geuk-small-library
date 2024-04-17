import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: String } }
) {
  try {
    const foundBook = await Book.findOne({ manage_id: params.id });
    return NextResponse.json(foundBook);
  } catch (err) {}
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: String } }
) {
  try {
    const foundBook = await Book.findOne({ manage_id: params.id });
    const newBookData = await req.json();

    foundBook.title = newBookData.title;
    foundBook.author = newBookData.author;
    foundBook.save();

    return NextResponse.json({ message: "Book Updated" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: String } }
) {
  try {
    await Book.deleteOne({ manage_id: params.id });
    return NextResponse.json({ message: "Book Deleted" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
