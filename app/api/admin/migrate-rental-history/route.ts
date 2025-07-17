import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";
import LibraryUser from "@/app/(models)/User";
import { getServerSession } from "next-auth";

// 기존 대여 기록의 이메일을 사용자의 회사 이메일로 업데이트하는 마이그레이션
export async function POST(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const adminUser = await LibraryUser.findOne({ email: session.user.email });
    if (!adminUser?.admin) {
      return NextResponse.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    console.log("=== 대여 기록 이메일 마이그레이션 시작 ===");

    // 현재 대여 중인 모든 도서 조회
    const rentedBooks = await Book.find({
      "rental_info.rent_available": false,
      "rental_info.user_email": { $exists: true, $ne: "" },
    });

    console.log(`대여 중인 도서 ${rentedBooks.length}권 확인`);

    let updatedCount = 0;
    let errors = [];

    for (const book of rentedBooks) {
      try {
        const currentEmail = book.rental_info.user_email;

        // 현재 이메일로 사용자 정보 조회 (개인 이메일로 대여한 경우)
        const user = await LibraryUser.findOne({ email: currentEmail });

        if (user && user.company_email && user.company_email !== currentEmail) {
          // 회사 이메일이 있고 현재 이메일과 다른 경우 업데이트
          book.rental_info.user_email = user.company_email;
          await book.save();

          console.log(
            `업데이트: ${book.manage_id} - ${currentEmail} → ${user.company_email}`
          );
          updatedCount++;
        }
      } catch (error) {
        console.error(`도서 ${book.manage_id} 업데이트 실패:`, error);
        errors.push({
          book_id: book.manage_id,
          error: (error as Error).message,
        });
      }
    }

    console.log(`=== 마이그레이션 완료: ${updatedCount}건 업데이트 ===`);

    return NextResponse.json({
      success: true,
      message: "대여 기록 이메일 마이그레이션이 완료되었습니다.",
      total_books: rentedBooks.length,
      updated_count: updatedCount,
      errors: errors,
    });
  } catch (error) {
    console.error("마이그레이션 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "마이그레이션 중 오류가 발생했습니다.",
        details: (error as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 마이그레이션 대상 조회 (실제 실행 전 확인용)
export async function GET(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const adminUser = await LibraryUser.findOne({ email: session.user.email });
    if (!adminUser?.admin) {
      return NextResponse.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    // 현재 대여 중인 모든 도서 조회
    const rentedBooks = await Book.find({
      "rental_info.rent_available": false,
      "rental_info.user_email": { $exists: true, $ne: "" },
    });

    let migrationTargets = [];

    for (const book of rentedBooks) {
      const currentEmail = book.rental_info.user_email;
      const user = await LibraryUser.findOne({ email: currentEmail });

      if (user && user.company_email && user.company_email !== currentEmail) {
        migrationTargets.push({
          book_id: book.manage_id,
          book_title: book.title,
          current_email: currentEmail,
          new_email: user.company_email,
          user_name: user.real_name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total_rented_books: rentedBooks.length,
      migration_targets: migrationTargets,
      target_count: migrationTargets.length,
    });
  } catch (error) {
    console.error("마이그레이션 대상 조회 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "마이그레이션 대상 조회 중 오류가 발생했습니다.",
        details: (error as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
