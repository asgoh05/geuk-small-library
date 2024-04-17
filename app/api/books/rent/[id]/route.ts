import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";

type RentalInfo = {
  rent_date: Date;
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

    foundBook.rental_info.rent_available = false;
    foundBook.rental_info.return_date = "";
    foundBook.rental_info.rent_date = rentalInfo.rent_date;
    foundBook.rental_info.user_name = rentalInfo.user_name;
    foundBook.rental_info.user_email = rentalInfo.user_email;
    foundBook.save();

    return NextResponse.json(
      { message: `Success ${rentalInfo.user_name} rent book` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}