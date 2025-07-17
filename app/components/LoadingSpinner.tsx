"use client";
import { FaBookBookmark } from "react-icons/fa6";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
  backdrop?: boolean;
}

export default function LoadingSpinner({
  message = "로딩 중...",
  size = "medium",
  fullScreen = false,
  backdrop = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl",
  };

  const containerClasses = fullScreen
    ? `fixed inset-0 flex flex-col items-center justify-center z-50 ${
        backdrop ? "backdrop-blur-md bg-black/20" : "bg-white"
      }`
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* 브랜드 아이콘과 함께 회전하는 스피너 */}
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin`}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaBookBookmark className="text-cyan-600 text-xs" />
          </div>
        </div>

        {/* 로딩 메시지 */}
        <div className="text-center">
          <p className={`${textSizeClasses[size]} text-gray-700 font-medium`}>
            {message}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>

        {/* 브랜드 텍스트 */}
        <p className="text-xs text-gray-500 mt-2">GEUK Library</p>
      </div>
    </div>
  );
}
