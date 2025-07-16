"use client";
import { IBook } from "../(models)/Book";
import BookCard from "./BookCard";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface InfiniteScrollBooksProps {
  books: IBook[];
  userRentalBooks: IBook[];
  onBookUpdate: () => void;
}

const InfiniteScrollBooks = memo(function InfiniteScrollBooks({
  books,
  userRentalBooks,
  onBookUpdate,
}: InfiniteScrollBooksProps) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_LOAD = 12;

  // 더 많은 아이템 로드
  const loadMoreItems = useCallback(() => {
    if (visibleCount >= books.length) return;

    setIsLoading(true);
    // 로딩 시뮬레이션 (실제로는 서버에서 데이터를 가져올 수 있음)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_LOAD, books.length));
      setIsLoading(false);
    }, 500);
  }, [visibleCount, books.length]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          !isLoading &&
          visibleCount < books.length
        ) {
          loadMoreItems();
        }
      },
      {
        rootMargin: "100px", // 100px 전에 미리 로드
        threshold: 0.1,
      }
    );

    const currentElement = observerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [loadMoreItems, isLoading, visibleCount, books.length]);

  // books 배열이 변경되면 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(Math.min(ITEMS_PER_LOAD, books.length));
  }, [books]);

  const visibleBooks = books.slice(0, visibleCount);
  const hasMore = visibleCount < books.length;

  return (
    <div>
      {/* 도서 그리드 */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {visibleBooks.map((book) => (
          <div key={book._id}>
            <BookCard
              book={book}
              isMyBook={
                userRentalBooks.find(
                  (mybook) => mybook.manage_id === book.manage_id
                ) !== undefined
              }
              noRentBook={userRentalBooks.length}
              onBookUpdate={onBookUpdate}
            />
          </div>
        ))}
      </div>

      {/* 무한 스크롤 트리거 & 로딩 인디케이터 */}
      {hasMore && (
        <div className="flex justify-center items-center py-8">
          <div ref={observerRef} className="flex flex-col items-center gap-3">
            {isLoading ? (
              <LoadingSpinner
                message="더 많은 도서를 불러오는 중..."
                size="medium"
              />
            ) : (
              <div className="text-center">
                <button
                  onClick={loadMoreItems}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg"
                >
                  더 많은 도서 보기 ({books.length - visibleCount}권 남음)
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  스크롤하면 자동으로 로드됩니다
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 모든 아이템 로드 완료 메시지 */}
      {!hasMore && books.length > ITEMS_PER_LOAD && (
        <div className="flex justify-center items-center py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm font-medium">📚 모든 도서를 확인했습니다!</p>
            <p className="text-xs mt-1">총 {books.length}권의 도서</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default InfiniteScrollBooks;
