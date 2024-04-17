import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";

type RentalInfo = {
  return_date: String;
  user_name: String;
  user_email: String;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: String } }
) {
  try {
    const foundBook = await Book.findOne({ manage_id: params.id });
    const rentalInfo: RentalInfo = await req.json();

    if (foundBook.rental_info.user_email !== rentalInfo.user_email)
      return NextResponse.json(
        { message: "User is not matching" },
        { status: 400 }
      );

    foundBook.rental_info.rent_available = true;
    foundBook.rental_info.return_date = rentalInfo.return_date;
    foundBook.save();

    return NextResponse.json(
      { message: `Success ${rentalInfo.user_name} returned book` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
