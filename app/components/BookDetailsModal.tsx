import { IBook } from "../(models)/Book";
import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";

interface BookDetailsModalProps {
  book: IBook;
  toggleModal: () => void;
}

export default function BookDetailsModal({
  book,
  toggleModal,
}: BookDetailsModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleModal]);

  // backdrop 클릭으로 모달 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-xl flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative min-w-80 max-w-96 bg-white shadow-2xl py-2 rounded-xl border">
        {/* 우측 상단 Close 버튼 */}
        <button
          type="button"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200 shadow-sm z-10"
          onClick={toggleModal}
        >
          <FaTimes className="text-xs" />
        </button>

        {book?.rental_info.rent_available ? (
          <p className="absolute text-xs bg-cyan-300 text-cyan-800 p-1 rounded-full left-2 top-2 font-medium">
            대여 가능
          </p>
        ) : (
          <p className="absolute text-xs bg-slate-300 text-slate-700 p-1 rounded-full left-2 top-2 font-medium">
            대여 불가
          </p>
        )}
        <div className="text-sm font-medium text-gray-900 border-b border-gray-300 py-3 px-4 mb-4 flex justify-center">
          <p className="text-md">{book?.manage_id}</p>
        </div>
        <div className="">
          <div className="flex flex-col w-full h-full gap-3 justify-center items-center">
            <div className="flex flex-row gap-2 items-end mx-8">
              <p className="text-xs">책 이름 :</p>
              <p className="text-md max-w-52">{book?.title}</p>
            </div>
            <div className="flex flex-row gap-2 items-end">
              <p className="text-xs">저자 :</p>
              <p className="text-md">{book?.author}</p>
            </div>
            <div className="flex flex-row gap-2 items-end">
              <p className="text-xs">등록일 :</p>
              <p className="text-md">
                {book?.reg_date.toString().substring(0, 10)}
              </p>
            </div>
            <div className="gap-2 border mx-4 py-4 px-20 rounded-lg">
              <p className="text-xs text-center pb-4">최근 사용자</p>
              <p className="text-md text-center">
                <i>{book?.rental_info.user_name}</i>
              </p>
              <p className="text-xs text-center text-neutral-500">
                <i>{book?.rental_info.user_email}</i>
              </p>
              <div className="flex flex-row gap-2 items-end pt-4">
                <p className="text-xs">대여한 날짜 :</p>
                <p className="text-xs">
                  {book?.rental_info.rent_date?.toString().substring(0, 10)}
                </p>
              </div>
              <div className="flex flex-row gap-2 items-end">
                <p className="text-xs">반납 예정일 :</p>
                <p className="text-xs">
                  {book?.rental_info.expected_return_date
                    ?.toString()
                    .substring(0, 10)}
                </p>
              </div>
              <div className="flex flex-row gap-2 items-end">
                <p className="text-xs">반납한 날짜 :</p>
                <p className="text-xs">
                  {book?.rental_info.return_date
                    ? book?.rental_info.return_date.toString().substring(0, 10)
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 flex justify-center items-center mt-2 px-4 pt-2">
          <div className="text-sm font-medium text-gray-700">
            <p className="text-center text-xs pt-6 text-neutral-400">
              &copy; Ultrasound Korea, GE Healthcare
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
