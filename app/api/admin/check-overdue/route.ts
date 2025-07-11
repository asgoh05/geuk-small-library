import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";
import LibraryUser from "@/app/(models)/User";
import { RemainingDays } from "@/app/(general)/datetime";

// 연체 도서 확인 및 사용자 정보 조회
export async function GET(req: NextRequest) {
  try {
    console.log("=== 연체 도서 확인 시작 ===");

    // 대여중인 도서들 조회 (rent_available이 false인 도서들)
    const rentedBooks = await Book.find({
      "rental_info.rent_available": false,
      "rental_info.expected_return_date": { $exists: true, $ne: null },
    });

    console.log(`대여중인 도서 ${rentedBooks.length}권 확인`);

    // 연체된 도서들 필터링
    const overdueBooks = rentedBooks.filter((book) => {
      const expectedReturnDate = new Date(
        book.rental_info.expected_return_date
      );
      const remainingDays = RemainingDays(expectedReturnDate);
      return remainingDays < 0; // 음수면 연체
    });

    console.log(`연체된 도서 ${overdueBooks.length}권 발견`);

    // 연체된 도서와 사용자 정보 매핑
    const overdueWithUserInfo = await Promise.all(
      overdueBooks.map(async (book) => {
        try {
          // Google 계정 이메일로 사용자 정보 조회
          const user = await LibraryUser.findOne({
            email: book.rental_info.user_email,
          });

          if (!user) {
            console.warn(
              `사용자 정보를 찾을 수 없음: ${book.rental_info.user_email}`
            );
            return null;
          }

          const expectedReturnDate = new Date(
            book.rental_info.expected_return_date
          );
          const overdueDays = Math.abs(RemainingDays(expectedReturnDate));

          return {
            book: {
              manage_id: book.manage_id,
              title: book.title,
              author: book.author,
              rent_date: book.rental_info.rent_date,
              expected_return_date: book.rental_info.expected_return_date,
            },
            user: {
              real_name: user.real_name,
              email: user.email,
              company_email: user.company_email,
            },
            overdue_days: overdueDays,
          };
        } catch (error) {
          console.error(
            `사용자 정보 조회 실패: ${book.rental_info.user_email}`,
            error
          );
          return null;
        }
      })
    );

    // null 값 제거
    const validOverdueBooks = overdueWithUserInfo.filter(
      (item) => item !== null
    );

    console.log(`연체 알림 대상: ${validOverdueBooks.length}건`);

    return NextResponse.json({
      success: true,
      total_rented: rentedBooks.length,
      total_overdue: overdueBooks.length,
      valid_overdue: validOverdueBooks.length,
      overdue_books: validOverdueBooks,
    });
  } catch (error) {
    console.error("연체 도서 확인 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "연체 도서 확인 중 오류가 발생했습니다.",
        details: (error as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
