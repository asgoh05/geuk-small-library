import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";
import LibraryUser from "@/app/(models)/User";

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

    if (!foundBook) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
    }

    // 현재 요청한 사용자의 정보를 조회 (개인 이메일 또는 회사 이메일로)
    const requestUser = await LibraryUser.findOne({
      $or: [
        { email: rentalInfo.user_email },
        { company_email: rentalInfo.user_email },
      ],
    });

    let isAuthorizedUser = false;

    if (requestUser) {
      // 등록된 사용자인 경우: 개인 이메일 또는 회사 이메일이 대여 기록과 일치하는지 확인
      isAuthorizedUser =
        foundBook.rental_info.user_email === requestUser.email ||
        foundBook.rental_info.user_email === requestUser.company_email;
    } else {
      // 미등록 사용자인 경우: 정확히 일치하는지만 확인 (기존 로직)
      isAuthorizedUser =
        foundBook.rental_info.user_email === rentalInfo.user_email;
    }

    if (!isAuthorizedUser) {
      return NextResponse.json(
        { message: "User is not matching" },
        { status: 400 }
      );
    }

    // 반납 처리: 연체 목록에서 제거하면서 히스토리는 유지
    foundBook.rental_info.rent_available = true;
    foundBook.rental_info.return_date = rentalInfo.return_date;

    // 연체 목록에서 완전히 제거 (expected_return_date만 null로 설정)
    foundBook.rental_info.expected_return_date = null;

    // 최근 사용자 히스토리는 유지 (상세 페이지에서 표시용)
    // foundBook.rental_info.rent_date - 유지
    // foundBook.rental_info.user_name - 유지
    // foundBook.rental_info.user_email - 유지

    await foundBook.save();

    return NextResponse.json(
      { message: `Success ${rentalInfo.user_name} returned book` },
      { status: 200 }
    );
  } catch (err) {
    console.error("반납 처리 중 오류:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
