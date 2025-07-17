import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import LibraryUser from "@/app/(models)/User";

// 한글 실명 유효성 검사 함수
function validateKoreanName(name: string): boolean {
  // 한글만 허용, 2-4글자
  const koreanNameRegex = /^[가-힣]{2,4}$/;
  return koreanNameRegex.test(name);
}

// 회사 이메일 유효성 검사 함수 (@gehealthcare.com 도메인)
function validateCompanyEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gehealthcare\.com$/;
  return emailRegex.test(email);
}

// 사용자 정보 수정
export async function PUT(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { real_name, company_email } = body;

    // 필수 필드 확인
    if (!real_name || !company_email) {
      return NextResponse.json(
        { message: "실명과 회사 이메일을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 한글 실명 유효성 검사
    if (!validateKoreanName(real_name)) {
      return NextResponse.json(
        { message: "실명은 한글 2-4글자로 입력해주세요." },
        { status: 400 }
      );
    }

    // 회사 이메일 유효성 검사
    if (!validateCompanyEmail(company_email)) {
      return NextResponse.json(
        { message: "@gehealthcare.com 도메인의 이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    // 현재 사용자 찾기
    const currentUser = await LibraryUser.findOne({
      email: session.user.email,
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "등록되지 않은 사용자입니다." },
        { status: 404 }
      );
    }

    // 다른 사용자가 동일한 회사 이메일을 사용하고 있는지 확인
    const emailConflictUser = await LibraryUser.findOne({
      company_email,
      email: { $ne: session.user.email }, // 현재 사용자 제외
    });

    if (emailConflictUser) {
      return NextResponse.json(
        { message: "이미 다른 사용자가 사용 중인 회사 이메일입니다." },
        { status: 409 }
      );
    }

    // 사용자 정보 업데이트
    currentUser.real_name = real_name.trim();
    currentUser.company_email = company_email.trim();

    await currentUser.save();

    return NextResponse.json(
      {
        message: "정보가 성공적으로 수정되었습니다!",
        user: {
          real_name: currentUser.real_name,
          email: currentUser.email,
          company_email: currentUser.company_email,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("=== 사용자 정보 수정 에러 ===");
    console.error("에러 타입:", (err as any)?.constructor?.name);
    console.error("에러 메시지:", (err as Error)?.message);
    console.error("전체 에러:", err);
    console.error("스택 트레이스:", (err as Error)?.stack);

    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: (err as Error)?.message || "Unknown error",
        errorType: (err as any)?.constructor?.name || "Unknown",
      },
      { status: 500 }
    );
  }
}

// 현재 사용자 정보 조회 (선택적으로 구현)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const user = await LibraryUser.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "등록되지 않은 사용자입니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        real_name: user.real_name,
        email: user.email,
        company_email: user.company_email,
        registered_at: user.registered_at,
        banned: user.banned,
        admin: user.admin,
      },
    });
  } catch (err) {
    console.error("사용자 정보 조회 오류:", err);
    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: (err as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
