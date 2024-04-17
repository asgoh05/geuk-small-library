import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";
import { messaging } from "firebase-admin";

// 사용자가 이미 대여한 책이 있는지 확인
// e.g. http://localhost:3000//api/books/rent?email=asgoh05@gmail.com
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const foundBook = await Book.findOne({
      "rental_info.rent_available": false,
      "rental_info.user_email": email,
    });
    return NextResponse.json(foundBook);
  } catch (err) {
    return NextResponse.json({ message: "Server Error", err }, { status: 500 });
  }
}
