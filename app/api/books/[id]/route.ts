import { NextRequest, NextResponse } from "next/server";
import Book, { IBookInternal } from "@/app/(models)/Book";

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
    const foundBook = await Book.findOne({
      manage_id: params.id,
    });
    const newBookData = (await req.json()) as IBookInternal;

    foundBook.title = newBookData.title;
    foundBook.author = newBookData.author;
    foundBook.comments = newBookData.comments;
    foundBook.img_url = newBookData.img_url;
    foundBook.reg_date = newBookData.reg_date;
    foundBook.rental_info.user_name = newBookData.rental_info.user_name;
    foundBook.rental_info.user_email = newBookData.rental_info.user_email;
    foundBook.rental_info.rent_date = newBookData.rental_info.rent_date;
    foundBook.rental_info.expected_return_date =
      newBookData.rental_info.expected_return_date;
    foundBook.rental_info.return_date = newBookData.rental_info.return_date;
    foundBook.rental_info.rent_available =
      newBookData.rental_info.rent_available;
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
