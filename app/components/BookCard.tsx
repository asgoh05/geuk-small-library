import { IBook } from "../(models)/Book";

interface BookCardProps {
  book: IBook;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="max-w-md rounded-lg overflow-hidden shadow-md border my-1 hover:bg-neutral-100">
      <div className="px-6 py-4">
        <div className="flex items-baseline">
          <p className="font-bold mb-2">{book.title}&nbsp;&nbsp;</p>
          <p className="text-gray-500 text-xs">{book.author}</p>
        </div>
        <p className="text-gray-500 text-xs">{book.manage_id}</p>
      </div>
      <div className="px-6 pb-2">
        {book.rental_info.rent_available ? (
          <span className="inline-block bg-green-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2 ">
            #대여 가능
          </span>
        ) : (
          <span className="inline-block bg-red-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
            #대여 불가
          </span>
        )}

        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
          대여하기
        </span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
          상세정보
        </span>
      </div>
    </div>
  );
}
