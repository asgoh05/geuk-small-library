import { IBook } from "../(models)/Book";
interface BookDetailsModalProps {
  book: IBook;
  toggleModal: () => void;
}

export default function BookDetailsModal({
  book,
  toggleModal,
}: BookDetailsModalProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-300 flex justify-center items-center z-10">
      <div className="fixed min-w-80 max-w-96 bg-white shadow-lg py-2 rounded-md">
        {book?.rental_info.rent_available ? (
          <p className="absolute text-xs bg-green-300 p-1 rounded-full left-2">
            대여 가능
          </p>
        ) : (
          <p className="absolute text-xs bg-red-300 p-1 rounded-full left-2">
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
        <div className="border-t border-gray-300 flex justify-between items-center mt-2 px-4 pt-2">
          <div className="text-sm font-medium text-gray-700">
            <p className="text-center text-xs pt-6 text-neutral-400">
              &copy; Ultrasound Korea, GE Healthcare
            </p>
          </div>
          <button
            type="button"
            className="h-8 px-2 text-sm rounded-md bg-gray-700 text-white"
            onClick={toggleModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
