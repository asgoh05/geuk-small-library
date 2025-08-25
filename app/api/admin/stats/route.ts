import { NextRequest, NextResponse } from "next/server";
import LibraryUser from "@/app/(models)/User";
import Book from "@/app/(models)/Book";

export async function GET(request: NextRequest) {
  try {
    // 모든 통계를 병렬로 계산
    const [
      totalBooks,
      totalUsers,
      rentedBooks,
      overdueBooks,
      activeUsers,
      bannedUsers,
    ] = await Promise.all([
      // 총 도서 수
      Book.countDocuments(),

      // 총 사용자 수
      LibraryUser.countDocuments(),

      // 대여 중인 도서 수 (rent_available이 false인 도서)
      Book.countDocuments({ "rental_info.rent_available": false }),

      // 연체 도서 수 (대여 중이고, expected_return_date가 현재 날짜보다 과거이고, 아직 반납되지 않은 도서)
      // 반납된 도서는 rent_available이 true이므로 자동으로 제외됨
      Book.countDocuments({
        "rental_info.rent_available": false,
        "rental_info.expected_return_date": {
          $ne: null,
          $lt: new Date(),
        },
        // return_date가 null이거나 존재하지 않는 도서 (반납되지 않은 도서)
        $or: [
          { "rental_info.return_date": null },
          { "rental_info.return_date": { $exists: false } },
        ],
      }),

      // 활성 사용자 수 (banned가 false인 사용자)
      LibraryUser.countDocuments({ banned: false }),

      // 차단된 사용자 수 (banned가 true인 사용자)
      LibraryUser.countDocuments({ banned: true }),
    ]);

    const stats = {
      totalBooks,
      totalUsers,
      rentedBooks,
      overdueBooks,
      activeUsers,
      bannedUsers,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Admin 통계 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "통계 데이터를 가져오는데 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
