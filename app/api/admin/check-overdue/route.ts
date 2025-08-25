import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";
import LibraryUser from "@/app/(models)/User";
import { RemainingDays } from "@/app/(general)/datetime";

// 연체 도서 확인 및 사용자 정보 조회
export async function GET(req: NextRequest) {
  try {
    console.log("=== 연체 도서 확인 시작 ===");

    // 대여중인 도서들 조회 (rent_available이 false이고, expected_return_date가 존재하는 도서들)
    // 반납된 도서는 자동으로 제외됨 (rent_available이 true이므로)
    const rentedBooks = await Book.find({
      "rental_info.rent_available": false,
      "rental_info.expected_return_date": { $exists: true, $ne: null },
    }).populate("rental_info");

    console.log(`대여중인 도서 ${rentedBooks.length}권 확인`);

    // 연체된 도서들 필터링 (가상 필드 활용)
    const overdueBooks = rentedBooks.filter((book) => {
      // 가상 필드가 있으면 사용, 없으면 기존 로직 사용
      if (book.isOverdue !== undefined) {
        return book.isOverdue;
      }

      // 기존 로직 (가상 필드가 없는 경우)
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

          const expectedReturnDate = new Date(
            book.rental_info.expected_return_date
          );
          const overdueDays = Math.abs(RemainingDays(expectedReturnDate));

          if (!user) {
            // 미등록 사용자인 경우
            console.warn(`미등록 사용자: ${book.rental_info.user_email}`);

            return {
              book: {
                manage_id: book.manage_id,
                title: book.title,
                author: book.author,
                rent_date: book.rental_info.rent_date,
                expected_return_date: book.rental_info.expected_return_date,
                return_date: book.rental_info.return_date, // 반납일 추가
              },
              user: {
                real_name: "미등록 사용자",
                email: book.rental_info.user_email,
                company_email: null, // 미등록 사용자는 회사 이메일 없음
                is_registered: false,
              },
              overdue_days: overdueDays,
            };
          }

          // 등록된 사용자인 경우
          return {
            book: {
              manage_id: book.manage_id,
              title: book.title,
              author: book.author,
              rent_date: book.rental_info.rent_date,
              expected_return_date: book.rental_info.expected_return_date,
              return_date: book.rental_info.return_date, // 반납일 추가
            },
            user: {
              real_name: user.real_name,
              email: user.email,
              company_email: user.company_email,
              is_registered: true,
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

    // null 값 제거 (에러가 발생한 경우만 제거, 미등록 사용자는 포함)
    const validOverdueBooks = overdueWithUserInfo.filter(
      (item) => item !== null
    );

    console.log(`연체 알림 대상: ${validOverdueBooks.length}건`);

    // 디버깅을 위한 추가 정보
    const debugInfo = {
      total_rented: rentedBooks.length,
      total_overdue: overdueBooks.length,
      valid_overdue: validOverdueBooks.length,
      sample_books: rentedBooks.slice(0, 3).map((book) => ({
        manage_id: book.manage_id,
        title: book.title,
        rent_available: book.rental_info.rent_available,
        expected_return_date: book.rental_info.expected_return_date,
        return_date: book.rental_info.return_date,
        isOverdue: book.isOverdue,
      })),
    };

    return NextResponse.json({
      success: true,
      ...debugInfo,
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
