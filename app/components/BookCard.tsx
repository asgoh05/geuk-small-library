import { IBook } from "../(models)/Book";
import { AddDays, RemainingDays, SubstractDate } from "../(general)/datetime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import BookDetailsModal from "./BookDetailsModal";
import ConfirmModal from "./ConfirmModal";
import AlertModal from "./AlertModal";
import {
  FaUser,
  FaIdCard,
  FaDownload,
  FaUpload,
  FaInfoCircle,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarPlus,
} from "react-icons/fa";

export interface BookCardProps {
  book: IBook;
  isMyBook: boolean;
  noRentBook: number;
  onBookUpdate: () => void;
}

export default function BookCard({
  book,
  isMyBook,
  noRentBook,
  onBookUpdate,
}: BookCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [openDetailModal, setDetailModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const handleModal = () => {
    setDetailModal(!openDetailModal);
  };

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        onConfirm,
      });
    },
    []
  );

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "info" = "info"
    ) => {
      setAlertModal({
        isOpen: true,
        title,
        message,
        type,
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const closeAlert = useCallback(() => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 계산 결과를 메모이제이션
  const remainingDays = useMemo(() => {
    return book.rental_info.expected_return_date
      ? RemainingDays(new Date(book.rental_info.expected_return_date))
      : null;
  }, [book.rental_info.expected_return_date]);

  const returnBook = useCallback(() => {
    showConfirm(
      "도서 반납",
      `책 "${book.title}"을 반납하시겠습니까?`,
      async () => {
        closeConfirm();
        try {
          const res = await fetch(`api/books/return/${book.manage_id}`, {
            method: "PUT",
            body: JSON.stringify({
              return_date: Date.now(),
              user_name: session?.user?.real_name,
              user_email: session?.user?.company_email || session?.user?.email,
            }),
          });
          if (res.status === 200) {
            showAlert("반납 완료", "반납을 완료하였습니다", "success");
            onBookUpdate();
            router.push("/");
          } else {
            showAlert(
              "오류 발생",
              `에러가 발생했습니다. 관리자에게 문의하세요.\nERRROR CODE(${res.status})`,
              "error"
            );
          }
        } catch (err) {
          showAlert(
            "서버 오류",
            "서버에 문제가 있습니다. 관리자에게 문의하세요. ERROR Unknown",
            "error"
          );
        }
      }
    );
  }, [
    book.title,
    book.manage_id,
    session?.user?.real_name,
    session?.user?.company_email,
    session?.user?.email,
    showConfirm,
    showAlert,
    closeConfirm,
    onBookUpdate,
    router,
  ]);

  const rentBook = useCallback(() => {
    showConfirm(
      "도서 대여",
      `책 "${book.title}"을 대여하시겠습니까?`,
      async () => {
        closeConfirm();
        try {
          const res = await fetch(`api/books/rent/${book.manage_id}`, {
            method: "PUT",
            body: JSON.stringify({
              rent_date: Date.now(),
              user_name: session?.user?.real_name,
              user_email: session?.user?.company_email || session?.user?.email,
            }),
          });
          if (res.status === 200) {
            showAlert("대여 완료", "대여를 완료하였습니다", "success");
            onBookUpdate();
            router.push("/");
          } else {
            showAlert(
              "오류 발생",
              `에러가 발생했습니다. 관리자에게 문의하세요.\nERRROR CODE(${res.status})`,
              "error"
            );
          }
        } catch (err) {
          showAlert(
            "서버 오류",
            "서버에 문제가 있습니다. 관리자에게 문의하세요. ERROR Unknown",
            "error"
          );
        }
      }
    );
  }, [
    book.title,
    book.manage_id,
    session?.user?.real_name,
    session?.user?.company_email,
    session?.user?.email,
    showConfirm,
    showAlert,
    closeConfirm,
    onBookUpdate,
    router,
  ]);

  const extendRent = useCallback(() => {
    showConfirm(
      "대여 연장",
      `책 "${book.title}" 대여를 1주일 연장하시겠습니까?`,
      async () => {
        closeConfirm();
        try {
          const res = await fetch(`api/books/rent/${book.manage_id}`, {
            method: "PUT",
            body: JSON.stringify({
              rent_date: book.rental_info.rent_date,
              user_name: session?.user?.real_name,
              user_email: session?.user?.company_email || session?.user?.email,
              extend: true,
            }),
          });
          if (res.status === 200) {
            showAlert("연장 완료", "대여 연장을 완료하였습니다", "success");
            onBookUpdate();
          } else {
            showAlert(
              "오류 발생",
              `에러가 발생했습니다. 관리자에게 문의하세요.\nERRROR CODE(${res.status})`,
              "error"
            );
          }
        } catch (err) {
          showAlert(
            "서버 오류",
            "서버에 문제가 있습니다. 관리자에게 문의하세요. ERROR Unknown",
            "error"
          );
        }
      }
    );
  }, [
    book.title,
    book.manage_id,
    book.rental_info.rent_date,
    session?.user?.real_name,
    session?.user?.company_email,
    session?.user?.email,
    showConfirm,
    showAlert,
    closeConfirm,
    onBookUpdate,
  ]);

  // 상태에 따른 색상과 아이콘 결정 - 메모이제이션
  const statusConfig = useMemo(() => {
    if (book.rental_info.rent_available) {
      return {
        bgColor: "bg-gradient-to-r from-cyan-50 to-teal-50",
        borderColor: "border-cyan-200",
        statusIcon: <FaCheckCircle className="text-cyan-500" />,
        statusText: "대여가능",
        statusColor: "text-cyan-600",
      };
    } else {
      return {
        bgColor: "bg-gradient-to-r from-slate-50 to-gray-50",
        borderColor: "border-slate-200",
        statusIcon: <FaTimesCircle className="text-slate-500" />,
        statusText: "대여중",
        statusColor: "text-slate-600",
      };
    }
  }, [book.rental_info.rent_available]);

  // 반납 기한 상태 - 메모이제이션
  const dueDateConfig = useMemo(() => {
    if (!remainingDays || book.rental_info.rent_available) return null;

    if (remainingDays > 0) {
      return {
        icon: <FaClock className="text-cyan-500" />,
        text: `D-${remainingDays}`,
        bgColor: "bg-cyan-100",
        textColor: "text-cyan-700",
      };
    } else if (remainingDays === 0) {
      return {
        icon: <FaExclamationTriangle className="text-amber-500" />,
        text: "Today",
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
      };
    } else {
      return {
        icon: <FaExclamationTriangle className="text-rose-500" />,
        text: `D+${Math.abs(remainingDays)}`,
        bgColor: "bg-rose-100",
        textColor: "text-rose-700",
      };
    }
  }, [remainingDays, book.rental_info.rent_available]);

  return (
    <div className="h-full">
      {openDetailModal && (
        <BookDetailsModal book={book} toggleModal={handleModal} />
      )}

      <div
        className={`h-full max-w-sm rounded-xl overflow-hidden shadow-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} hover:shadow-xl transition-all duration-300 relative`}
      >
        {/* 대여중 뱃지 - 모달이 열려있지 않을 때만 표시 */}
        {!openDetailModal && isMyBook && !book.rental_info.rent_available && (
          <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10 shadow-md">
            내 도서
          </div>
        )}

        <div className="p-4">
          {/* 헤더: 제목과 상태 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                {book.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <FaUser className="text-xs" />
                <span className="truncate">{book.author}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {statusConfig.statusIcon}
              <span
                className={`text-xs font-medium ${statusConfig.statusColor}`}
              >
                {statusConfig.statusText}
              </span>
            </div>
          </div>

          {/* 도서 ID */}
          <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
            <FaIdCard className="text-xs" />
            <span>{book.manage_id}</span>
          </div>

          {/* 반납 기한 정보 */}
          {dueDateConfig && (
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg mb-3 ${dueDateConfig.bgColor}`}
            >
              {dueDateConfig.icon}
              <span
                className={`text-xs font-medium ${dueDateConfig.textColor}`}
              >
                반납 {dueDateConfig.text}
              </span>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-1.5">
            {/* 대여/반납 버튼 */}
            {isMyBook && !book.rental_info.rent_available ? (
              <button
                onClick={returnBook}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded-lg transition-colors duration-200 font-medium shadow-sm"
              >
                <FaUpload className="text-xs" />
                반납
              </button>
            ) : book.rental_info.rent_available &&
              book.rental_info.user_email ===
                (session?.user?.company_email || session?.user?.email) &&
              RemainingDays(AddDays(book.rental_info.return_date, 2)) >= 0 ? (
              <button
                onClick={() =>
                  showAlert(
                    "대여 불가",
                    "반납하신 책은 '반납일 익일' 까지 다시 대여하실 수 없습니다",
                    "info"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-300 text-slate-500 text-xs rounded-lg font-medium cursor-not-allowed"
              >
                <FaDownload className="text-xs" />
                대여불가
              </button>
            ) : !book.rental_info.rent_available ||
              (!isMyBook && noRentBook === 3) ? (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-300 text-slate-500 text-xs rounded-lg font-medium cursor-not-allowed">
                <FaDownload className="text-xs" />
                대여불가
              </button>
            ) : (
              <button
                onClick={rentBook}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors duration-200 font-medium shadow-sm"
              >
                <FaDownload className="text-xs" />
                대여
              </button>
            )}

            {/* 상세정보 버튼 */}
            <button
              onClick={handleModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors duration-200 font-medium shadow-sm"
            >
              <FaInfoCircle className="text-xs" />
              상세
            </button>

            {/* 대여연장 버튼 */}
            {isMyBook &&
              !book.rental_info.rent_available &&
              SubstractDate(
                book.rental_info.expected_return_date,
                book.rental_info.rent_date
              ) < 21 && (
                <button
                  onClick={extendRent}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg transition-colors duration-200 font-medium shadow-sm"
                >
                  <FaCalendarPlus className="text-xs" />
                  연장
                </button>
              )}
          </div>
        </div>
      </div>

      {/* New Modals - 조건부 렌더링으로 최적화 */}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      {alertModal.isOpen && (
        <AlertModal
          isOpen={alertModal.isOpen}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={closeAlert}
        />
      )}
    </div>
  );
}
