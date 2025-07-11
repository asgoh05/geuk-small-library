"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function RegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [realName, setRealName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");

  // 한글 실명 유효성 검사
  const validateKoreanName = (name: string): boolean => {
    const koreanNameRegex = /^[가-힣]{2,4}$/;
    return koreanNameRegex.test(name);
  };

  // 실시간 이름 유효성 검사
  useEffect(() => {
    if (realName.length > 0) {
      if (!validateKoreanName(realName)) {
        setNameError("실명은 한글 2-4글자로 입력해주세요.");
      } else {
        setNameError("");
      }
    } else {
      setNameError("");
    }
  }, [realName]);

  // 로그인하지 않은 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      setMessage("세션 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!validateKoreanName(realName)) {
      setMessage("실명은 한글 2-4글자로 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          real_name: realName.trim(),
          email: session.user.email,
          google_id: session.user.email, // 임시로 email을 google_id로 사용
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("가입이 완료되었습니다! 도서관을 이용해주세요.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setMessage(data.message || "가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="w-full min-h-screen bg-[url('/library_downloaded2.png')] bg-cover">
        <LoadingSpinner
          message="세션을 확인하는 중..."
          size="large"
          fullScreen={true}
          backdrop={true}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[url('/library_downloaded2.png')] bg-cover flex items-center justify-center">
      <div className="bg-white bg-opacity-95 rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            GEUK 도서관 회원가입
          </h1>
          <p className="text-sm text-gray-600">
            실명을 입력하여 가입을 완료해주세요
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Google 계정:</strong> {session.user?.email}
          </p>
          <p className="text-sm text-gray-700">
            <strong>이름:</strong> {session.user?.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="realName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              실명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="realName"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="한글 실명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              한글 2-4글자로 입력해주세요 (예: 홍길동)
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || nameError !== "" || realName.length === 0}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "가입 중..." : "가입하기"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.includes("완료")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            메인 페이지로 돌아가기
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; Ultrasound Korea, GE Healthcare
          </p>
        </div>
      </div>
    </div>
  );
}
