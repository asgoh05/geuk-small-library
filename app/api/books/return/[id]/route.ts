import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";
import LibraryUser from "@/app/(models)/User";

type RentalInfo = {
  return_date: string | number; // Date.now() 또는 ISO 문자열 모두 허용
  user_name: string;
  user_email: string;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // return_date를 안전하게 Date 객체로 변환
    let returnDate: Date;
    try {
      if (typeof rentalInfo.return_date === "number") {
        // Date.now()로 전달된 경우
        returnDate = new Date(rentalInfo.return_date);
      } else if (typeof rentalInfo.return_date === "string") {
        // ISO 문자열로 전달된 경우
        returnDate = new Date(rentalInfo.return_date);
      } else {
        // 기본값으로 현재 시간 사용
        returnDate = new Date();
      }

      // 유효한 날짜인지 확인
      if (isNaN(returnDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (error) {
      console.warn("return_date 파싱 실패, 현재 시간 사용:", error);
      returnDate = new Date();
    }

    // 반납 처리: 연체 목록에서 제거하면서 히스토리는 유지
    foundBook.rental_info.rent_available = true;
    foundBook.rental_info.return_date = returnDate;

    // 연체 목록에서 완전히 제거 (expected_return_date를 null로 설정)
    foundBook.rental_info.expected_return_date = null;

    // 최근 사용자 히스토리는 유지 (상세 페이지에서 표시용)
    // foundBook.rental_info.rent_date - 유지
    // foundBook.rental_info.user_name - 유지
    // foundBook.rental_info.user_email - 유지

    await foundBook.save();

    console.log(
      `도서 반납 완료: ${foundBook.manage_id} (${
        foundBook.title
      }) - 반납일: ${returnDate.toISOString()}`
    );

    return NextResponse.json(
      {
        message: `Success ${rentalInfo.user_name} returned book`,
        return_date: returnDate.toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("반납 처리 중 오류:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
