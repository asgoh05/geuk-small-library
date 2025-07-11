import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import LibraryUser, { IUser } from "@/app/(models)/User";

// 사용자 목록 조회 (관리자용)
export async function GET(req: NextRequest) {
  try {
    // 관리자 권한 체크
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

    const users = await LibraryUser.find({}).sort({ registered_at: -1 });

    const userList = users.map((user: IUser) => ({
      _id: user._id,
      real_name: user.real_name,
      email: user.email,
      registered_at: user.registered_at,
      banned: user.banned,
      admin: user.admin,
    }));

    return NextResponse.json({
      message: "사용자 목록 조회 성공",
      users: userList,
      total: userList.length,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다.", err },
      { status: 500 }
    );
  }
}

// 사용자 상태 업데이트 (강제 탈퇴/복구/관리자 권한)
export async function PUT(req: NextRequest) {
  try {
    // 관리자 권한 체크
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

    const body = await req.json();
    const { user_id, action } = body; // action: 'ban', 'unban', 'make_admin', 'remove_admin'

    if (!user_id || !action) {
      return NextResponse.json(
        { message: "user_id와 action 필드가 필요합니다." },
        { status: 400 }
      );
    }

    if (!["ban", "unban", "make_admin", "remove_admin"].includes(action)) {
      return NextResponse.json(
        {
          message:
            "action은 'ban', 'unban', 'make_admin', 'remove_admin' 중 하나여야 합니다.",
        },
        { status: 400 }
      );
    }

    const user = await LibraryUser.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 자기 자신의 관리자 권한 제거 방지
    if (action === "remove_admin" && user.email === session.user.email) {
      return NextResponse.json(
        { message: "자기 자신의 관리자 권한은 제거할 수 없습니다." },
        { status: 400 }
      );
    }

    let actionMessage = "";

    // 사용자 상태 업데이트
    switch (action) {
      case "ban":
        user.banned = true;
        actionMessage = "강제 탈퇴";
        break;
      case "unban":
        user.banned = false;
        actionMessage = "복구";
        break;
      case "make_admin":
        user.admin = true;
        actionMessage = "관리자 권한 부여";
        break;
      case "remove_admin":
        user.admin = false;
        actionMessage = "관리자 권한 제거";
        break;
    }

    await user.save();

    return NextResponse.json({
      message: `${user.real_name} 사용자가 ${actionMessage}되었습니다.`,
      user: {
        _id: user._id,
        real_name: user.real_name,
        email: user.email,
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
