"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FaBook,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendar,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { IBookInternal } from "@/app/(models)/Book";

interface BookManagementPageProps {}

export default function BookManagementPage({}: BookManagementPageProps) {
  const [books, setBooks] = useState<IBookInternal[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<IBookInternal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBook, setEditingBook] = useState<IBookInternal | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // 도서 목록 가져오기
  useEffect(() => {
    fetchBooks();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.manage_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/books");
      if (!response.ok) {
        throw new Error("도서 목록을 가져오는데 실패했습니다.");
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("도서 목록 조회 실패:", error);
      alert("도서 목록을 가져오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (book: IBookInternal) => {
    setEditingBook({ ...book });
  };

  const handleSaveEdit = async () => {
    if (!editingBook) return;

    try {
      const response = await fetch(`/api/books/${editingBook.manage_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingBook),
      });

      if (!response.ok) {
        throw new Error("도서 수정에 실패했습니다.");
      }

      alert("도서가 성공적으로 수정되었습니다.");
      setEditingBook(null);
      fetchBooks(); // 목록 새로고침
    } catch (error) {
      console.error("도서 수정 실패:", error);
      alert("도서 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (manage_id: string) => {
    if (!confirm("정말로 이 도서를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/books/${manage_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("도서 삭제에 실패했습니다.");
      }

      alert("도서가 성공적으로 삭제되었습니다.");
      fetchBooks(); // 목록 새로고침
    } catch (error) {
      console.error("도서 삭제 실패:", error);
      alert("도서 삭제에 실패했습니다.");
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FaBook className="text-2xl" />
          도서 관리
        </h1>
        <p className="text-orange-100">
          등록된 도서를 수정하거나 삭제할 수 있습니다.
        </p>
      </div>

      {/* 검색 및 통계 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="도서명, 작가명, 관리번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none flex-1 lg:w-80"
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              총{" "}
              <span className="font-bold text-orange-600">{books.length}</span>
              권
            </span>
            <span className="text-gray-600">
              검색결과{" "}
              <span className="font-bold text-orange-600">
                {filteredBooks.length}
              </span>
              권
            </span>
          </div>
        </div>

        {/* 도서 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  관리번호
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  도서명
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  작가
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  등록일
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  대여상태
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  대여자
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.manage_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">
                    {book.manage_id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {book.img_url ? (
                        <Image
                          src={book.img_url}
                          alt={book.title}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <FaImage className="text-gray-400 text-xs" />
                        </div>
                      )}
                      <span className="font-medium">{book.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{book.author}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(book.reg_date)}
                  </td>
                  <td className="py-3 px-4">
                    {book.rental_info.rent_available ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <FaCheckCircle />
                        대여가능
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <FaTimesCircle />
                        대여중
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {!book.rental_info.rent_available ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          {book.rental_info.user_name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatDate(book.rental_info.rent_date)} ~{" "}
                          {formatDate(book.rental_info.expected_return_date)}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="도서 수정"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(book.manage_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="도서 삭제"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 도서가 없습니다."}
            </div>
          )}
        </div>
      </div>

      {/* 도서 편집 모달 */}
      {editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                도서 정보 수정
              </h2>
              <button
                onClick={() => setEditingBook(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관리번호
                </label>
                <input
                  type="text"
                  value={editingBook.manage_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  도서명 *
                </label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  작가 *
                </label>
                <input
                  type="text"
                  value={editingBook.author}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, author: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이미지 URL
                </label>
                <input
                  type="url"
                  value={editingBook.img_url}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, img_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  등록일
                </label>
                <input
                  type="date"
                  value={
                    editingBook.reg_date
                      ? new Date(editingBook.reg_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditingBook({
                      ...editingBook,
                      reg_date: new Date(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비고
                </label>
                <textarea
                  value={editingBook.comments}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, comments: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="도서에 대한 추가 정보..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setEditingBook(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaSave />
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
