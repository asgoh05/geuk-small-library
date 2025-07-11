"use client";
import { getDateString } from "@/app/(general)/datetime";
import { IBookInternal } from "@/app/(models)/Book";
import { useEffect, useRef, useState } from "react";
import writeXlsxFile from "write-excel-file";
import {
  FaDownload,
  FaFileExcel,
  FaBook,
  FaCalendar,
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";

export default function ExportPage() {
  const [books, setBooks] = useState<IBookInternal[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    totalBooks: 0,
    rentedBooks: 0,
    availableBooks: 0,
    overdueBooks: 0,
  });

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((books: IBookInternal[]) => {
        setBooks(books);

        // 통계 계산
        const total = books.length;
        const rented = books.filter(
          (book) => !book.rental_info.rent_available
        ).length;
        const available = total - rented;
        const overdue = books.filter((book) => {
          if (book.rental_info.rent_available) return false;
          if (!book.rental_info.expected_return_date) return false;
          return new Date(book.rental_info.expected_return_date) < new Date();
        }).length;

        setStats({
          totalBooks: total,
          rentedBooks: rented,
          availableBooks: available,
          overdueBooks: overdue,
        });
      })
      .catch(() => {
        setMessage("도서 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date(Date.now());
  const fileName = `GEUK_Library_downloaded_${getDateString(today)}`;

  async function downloadFile() {
    setIsDownloading(true);
    setMessage("");

    try {
      await writeXlsxFile(books, {
        schema,
        fileName: fileName,
      });
      setMessage(`파일이 성공적으로 다운로드되었습니다: ${fileName}.xlsx`);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("파일 다운로드 중 오류가 발생했습니다.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsDownloading(false);
    }
  }

  async function downloadFilteredFile(filter: "all" | "available" | "rented") {
    setIsDownloading(true);
    setMessage("");

    try {
      let filteredBooks = books;
      let fileNameSuffix = "";

      switch (filter) {
        case "available":
          filteredBooks = books.filter(
            (book) => book.rental_info.rent_available
          );
          fileNameSuffix = "_available";
          break;
        case "rented":
          filteredBooks = books.filter(
            (book) => !book.rental_info.rent_available
          );
          fileNameSuffix = "_rented";
          break;
        default:
          fileNameSuffix = "_all";
      }

      const customFileName = `GEUK_Library${fileNameSuffix}_${getDateString(
        today
      )}`;

      await writeXlsxFile(filteredBooks, {
        schema,
        fileName: customFileName,
      });

      setMessage(
        `${filteredBooks.length}권의 도서 정보가 다운로드되었습니다: ${customFileName}.xlsx`
      );
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("파일 다운로드 중 오류가 발생했습니다.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <FaDownload className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Excel 파일 내보내기</h1>
            <p className="text-purple-100">
              도서관 데이터를 Excel 파일로 다운로드합니다
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            message.includes("오류") || message.includes("실패")
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-green-50 border-green-500 text-green-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes("오류") || message.includes("실패") ? (
              <FaInfoCircle />
            ) : (
              <FaCheckCircle />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <FaBook className="text-blue-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">총 도서</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.totalBooks.toLocaleString()}권
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">대여 가능</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.availableBooks.toLocaleString()}권
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <FaUsers className="text-orange-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">대여 중</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.rentedBooks.toLocaleString()}권
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <FaCalendar className="text-red-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">연체</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.overdueBooks.toLocaleString()}권
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 다운로드 옵션 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaFileExcel className="text-purple-600" />
          다운로드 옵션
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 전체 다운로드 */}
          <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors duration-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FaDownload className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                전체 도서 목록
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                모든 도서의 정보를 포함한 완전한 목록을 다운로드합니다.
              </p>
              <button
                onClick={() => downloadFilteredFile("all")}
                disabled={isDownloading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    다운로드 중...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    전체 다운로드
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 대여 가능 도서만 */}
          <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-colors duration-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                대여 가능 도서
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                현재 대여 가능한 도서들만 필터링하여 다운로드합니다.
              </p>
              <button
                onClick={() => downloadFilteredFile("available")}
                disabled={isDownloading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    다운로드 중...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    대여가능 다운로드
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 대여 중 도서만 */}
          <div className="border-2 border-orange-200 rounded-lg p-6 hover:border-orange-400 transition-colors duration-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-orange-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">대여 중 도서</h3>
              <p className="text-sm text-gray-600 mb-4">
                현재 대여 중인 도서와 대여자 정보를 다운로드합니다.
              </p>
              <button
                onClick={() => downloadFilteredFile("rented")}
                disabled={isDownloading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    다운로드 중...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    대여중 다운로드
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 파일 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          생성될 파일 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">파일 형식</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <FaFileExcel className="text-green-600" />
                Excel 파일 (.xlsx)
              </li>
              <li className="flex items-center gap-2">
                <FaCalendar className="text-blue-600" />
                파일명: GEUK_Library_[필터]_{getDateString(today)}.xlsx
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">포함 정보</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 도서번호 (Manage ID)</li>
              <li>• 제목 (Title)</li>
              <li>• 저자 (Author)</li>
              <li>• 등록일 (reg_date)</li>
              <li>• 코멘트 (Note)</li>
              <li>• 대여 상태 및 대여자 정보</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 도움말 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          다운로드 안내
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            • 다운로드된 Excel 파일은 브라우저의 기본 다운로드 폴더에
            저장됩니다.
          </p>
          <p>• 파일명에는 다운로드 날짜가 포함되어 쉽게 구분할 수 있습니다.</p>
          <p>• 대용량 데이터의 경우 다운로드에 시간이 걸릴 수 있습니다.</p>
          <p>
            • 생성된 파일은 도서 추가(Excel) 기능에서 재업로드하여 사용할 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

const schema = [
  {
    column: "Manage ID",
    type: String,
    value: (book: IBookInternal) => book.manage_id,
  },
  {
    column: "Title",
    type: String,
    value: (book: IBookInternal) => book.title,
  },
  {
    column: "Author",
    type: String,
    value: (book: IBookInternal) => book.author,
  },
  {
    column: "reg_date",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) => new Date(book.reg_date),
  },
  {
    column: "Note",
    type: String,
    value: (book: IBookInternal) => book.comments,
  },
  {
    column: "대여중",
    type: String,
    value: (book: IBookInternal) =>
      book.rental_info.rent_available ? "" : "대여중",
  },
  {
    column: "최근이용자",
    type: String,
    value: (book: IBookInternal) => book.rental_info.user_name,
  },
  {
    column: "최근이용자(이메일)",
    type: String,
    value: (book: IBookInternal) => book.rental_info.user_email,
  },
  {
    column: "대여일",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) =>
      book.rental_info.rent_date ? new Date(book.rental_info.rent_date) : null,
  },
  {
    column: "반납예정일",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) =>
      book.rental_info.expected_return_date
        ? new Date(book.rental_info.expected_return_date)
        : null,
  },
  {
    column: "반납일",
    type: Date,
    format: "mm/dd/yyyy",
    value: (book: IBookInternal) =>
      book.rental_info.return_date
        ? new Date(book.rental_info.return_date)
        : null,
  },
];
