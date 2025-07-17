import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import LibraryUser from "@/app/(models)/User";

// 현재 로그인된 관리자 정보 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const user = await LibraryUser.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!user.admin) {
      return NextResponse.json(
        { success: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        real_name: user.real_name,
        email: user.email,
        company_email: user.company_email,
        admin: user.admin,
      },
    });
  } catch (error) {
    console.error("현재 사용자 정보 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "사용자 정보 조회 중 오류가 발생했습니다.",
        details: (error as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
