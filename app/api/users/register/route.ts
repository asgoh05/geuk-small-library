import { NextRequest, NextResponse } from "next/server";
import LibraryUser, { IUser } from "@/app/(models)/User";

// 한글 실명 유효성 검사 함수
function validateKoreanName(name: string): boolean {
  // 한글만 허용, 2-4글자
  const koreanNameRegex = /^[가-힣]{2,4}$/;
  return koreanNameRegex.test(name);
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== 회원가입 API 시작 ===");

    const body = await req.json();
    const { real_name, email, google_id } = body;

    console.log("받은 데이터:", { real_name, email, google_id });

    // 필수 필드 확인
    if (!real_name || !email || !google_id) {
      console.log("필수 필드 누락");
      return NextResponse.json(
        { message: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 한글 실명 유효성 검사
    if (!validateKoreanName(real_name)) {
      console.log("실명 유효성 검사 실패:", real_name);
      return NextResponse.json(
        { message: "실명은 한글 2-4글자로 입력해주세요." },
        { status: 400 }
      );
    }

    console.log("기존 사용자 확인 중...");

    // 이미 등록된 사용자인지 확인 (이메일 또는 Google ID로)
    const existingUser = await LibraryUser.findOne({
      $or: [{ email }, { google_id }],
    });

    if (existingUser) {
      console.log("이미 등록된 사용자:", existingUser.email);
      return NextResponse.json(
        { message: "이미 등록된 사용자입니다." },
        { status: 409 }
      );
    }

    console.log("새 사용자 생성 중...");

    // 새 사용자 생성
    const newUser = await LibraryUser.create({
      real_name,
      email,
      google_id,
      registered_at: new Date(),
      banned: false, // 기본값은 정상 사용자
      admin: false, // 기본값은 일반 사용자
    });

    console.log("사용자 생성 성공:", {
      _id: newUser._id,
      real_name: newUser.real_name,
      email: newUser.email,
      banned: newUser.banned,
      admin: newUser.admin,
    });

    return NextResponse.json(
      {
        message: "가입이 완료되었습니다! 도서관을 이용해주세요.",
        user: {
          real_name: newUser.real_name,
          email: newUser.email,
          banned: newUser.banned,
          admin: newUser.admin,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("=== 회원가입 에러 ===");
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

// 사용자 정보 조회 (Google ID로)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const google_id = url.searchParams.get("google_id");
    const email = url.searchParams.get("email");

    if (!google_id && !email) {
      return NextResponse.json(
        { message: "google_id 또는 email 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const user = await LibraryUser.findOne(
      google_id ? { google_id } : { email }
    );

    if (!user) {
      return NextResponse.json(
        { message: "등록되지 않은 사용자입니다.", registered: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registered: true,
      banned: user.banned,
      admin: user.admin,
      user: {
        real_name: user.real_name,
        email: user.email,
        registered_at: user.registered_at,
        banned: user.banned,
        admin: user.admin,
      },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다.", err },
      { status: 500 }
    );
  }
}
