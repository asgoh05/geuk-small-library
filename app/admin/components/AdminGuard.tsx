"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return; // 세션 로딩 중
    }

    if (status === "unauthenticated") {
      // 로그인하지 않은 사용자
      router.push("/");
      return;
    }

    if (session?.user) {
      if (!session.user.registered) {
        // 등록되지 않은 사용자
        router.push("/register");
        return;
      }

      if (session.user.banned) {
        // 탈퇴된 사용자
        router.push("/");
        return;
      }

      if (!session.user.admin) {
        // 관리자가 아닌 사용자
        router.push("/");
        return;
      }
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <LoadingSpinner
        message="관리자 권한을 확인하는 중..."
        size="large"
        fullScreen={true}
        backdrop={true}
      />
    );
  }

  if (status === "unauthenticated" || !session?.user?.admin) {
    return (
      <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl flex flex-col justify-center items-center z-10">
        <div className="text-center">
          <p className="text-xl mb-4">접근 권한이 없습니다</p>
          <p className="text-gray-600 mb-6">
            관리자만 접근할 수 있는 페이지입니다.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
