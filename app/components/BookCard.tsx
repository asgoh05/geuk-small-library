import { useSession } from "next-auth/react";
import { IBook } from "../(models)/Book";
import { useRouter } from "next/navigation";
import { AddDays, SubstractDays } from "../(general)/datetime";
import { useState } from "react";
import BookDetailsModal from "./BookDetailsModal";

export interface BookCardProps {
  hasRentalBook: boolean;
  book: IBook;
}

export default function BookCard({ book, hasRentalBook }: BookCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [openModal, setModal] = useState(false);
  const handleModal = () => {
    setModal(!openModal);
  };

  const rentDate = book.rental_info.rent_date
    ? new Date(book.rental_info.rent_date)
    : null;

  const returnDueDate = rentDate
    ? AddDays(book.rental_info.rent_date, 14).setHours(23, 59, 59)
    : null;

  const remainingDays = returnDueDate
    ? Math.floor((returnDueDate - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  // const today = new Date(Date.now());
  // const remainReturnDue = returnDueDate
  //   ? returnDueDate.setDate(returnDueDate.getDate() - today.getDate())
  //   : null;

  async function returnBook() {
    if (confirm(`책 "${book.title}"을 반납하시겠습니까?`)) {
      try {
        const res = await fetch(`api/books/return/${book.manage_id}`, {
          method: "PUT",
          body: JSON.stringify({
            return_date: Date.now(),
            user_name: session?.user?.name,
            user_email: session?.user?.email,
          }),
        });
        if (res.status === 200) {
          alert("반납을 완료하였습니다");
        } else {
          alert(
            `에러가 발생했습니다. 관리자에게 문의하세요. \n ERRROR CODE(${res.status})`
          );
        }
      } catch (err) {
        alert("서버에 문제가 있습니다. 관리자에게 문의하세요. ERROR Unknown");
      } finally {
        router.push("/");
      }
    } else return;
  }

  async function rentBook() {
    if (confirm(`책 "${book.title}"을 대여하시겠습니까?`)) {
      try {
        const res = await fetch(`api/books/rent/${book.manage_id}`, {
          method: "PUT",
          body: JSON.stringify({
            rent_date: Date.now(),
            user_name: session?.user?.name,
            user_email: session?.user?.email,
          }),
        });
        if (res.status === 200) {
          alert("대여를 완료하였습니다");
        } else {
          alert(
            `에러가 발생했습니다. 관리자에게 문의하세요. \n ERRROR CODE(${res.status})`
          );
        }
      } catch (err) {
        alert("서버에 문제가 있습니다. 관리자에게 문의하세요. ERROR Unknown");
      } finally {
        router.push("/");
      }
    } else return;
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md border gap-2 hover:bg-neutral-100">
      <div className="px-6 py-4">
        <div className="flex items-center">
          <p className="font-bold mb-2 max-w-60">{book.title}&nbsp;&nbsp;</p>
          <p className="text-gray-500 text-xs pl-4">{book.author}</p>
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

        {hasRentalBook &&
        !book.rental_info.rent_available &&
        book.rental_info.user_email === session?.user?.email ? (
          <span
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2 hover:text-blue-500 cursor-pointer"
            onClick={returnBook}
          >
            반납하기
          </span>
        ) : hasRentalBook || !book.rental_info.rent_available ? (
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mr-2 mb-2">
            대여하기
          </span>
        ) : (
          <span
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2 hover:text-blue-500 cursor-pointer"
            onClick={rentBook}
          >
            대여하기
          </span>
        )}
        <span
          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2 hover:text-blue-500 cursor-pointer"
          onClick={handleModal}
        >
          상세정보
        </span>
        <div>
          {!book.rental_info.rent_available &&
          remainingDays !== null &&
          remainingDays > 0 ? (
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
              #반납기한{"  "}
              <span className=" text-green-600 ">{`D-${remainingDays?.toString()}`}</span>
            </span>
          ) : !book.rental_info.rent_available &&
            remainingDays !== null &&
            remainingDays === 0 ? (
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
              #반납기한{"  "} <span className=" text-red-600 ">Today</span>
            </span>
          ) : !book.rental_info.rent_available &&
            remainingDays !== null &&
            remainingDays < 0 ? (
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
              #반납기한{"  "}
              <span className=" text-red-600 ">{`D+${Math.abs(
                remainingDays
              )?.toString()} over`}</span>
            </span>
          ) : (
            ""
          )}
        </div>
      </div>
      {openModal && <BookDetailsModal book={book} toggleModal={handleModal} />}
    </div>
  );
}
