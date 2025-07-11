"use client";
import { BaseSyntheticEvent, useState, useRef, useEffect } from "react";
import readXlsxFile, { ParsedObjectsResult } from "read-excel-file";
import { IBook, IBookInternal } from "@/app/(models)/Book";
import { IsSameDate, getDateString } from "@/app/(general)/datetime";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import {
  FaFileExcel,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";

interface IRow {
  manage_id: string;
  title: string;
  author: string;
  reg_date: Date;
  comments: string;
}

export default function AddBookExcelPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [books, setBooks] = useState<IBook[]>([]);
  const [booksToCreate, setbooksToCreate] = useState<IBookInternal[]>([]);
  const [booksToUpdate, setbooksToUpdate] = useState<IBookInternal[]>([]);
  const [booksToDelete, setbooksToDelete] = useState<IBook[]>([]);
  const [file, setFile] = useState("");
  const [uploadStep, setUploadStep] = useState<"upload" | "review" | "process">(
    "upload"
  );

  useEffect(() => {
    setLoading(true);
    fetch("/api/books")
      .then((res) => res.json())
      .then((books: IBook[]) => {
        setBooks(books);
        setLoading(false);
      })
      .catch(() => {
        setMessage("기존 도서 목록을 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, []);

  async function readFile(e: BaseSyntheticEvent) {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    setLoading(true);
    setMessage("");
    setUploadStep("process");

    try {
      const rows = await readXlsxFile(files[0], {
        schema,
        sheet: "GEUK 도서 리스트",
      });

      if (rows.errors.length > 0) {
        setMessage(`Excel 파일 처리 중 오류: ${rows.errors.join(", ")}`);
        setUploadStep("upload");
        return;
      }

      validateExcelData(rows.rows as IRow[]);
      setUploadStep("review");
    } catch (error) {
      setMessage(
        "Excel 파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요."
      );
      setUploadStep("upload");
    } finally {
      setLoading(false);
    }
  }

  function validateExcelData(excelData: IRow[]) {
    const createList: IBookInternal[] = [];
    const updateList: IBookInternal[] = [];
    const deleteList: IBook[] = [];

    // 기존 로직을 유지하면서 UI만 개선
    for (const row of excelData) {
      const existingBook = books.find(
        (book) => book.manage_id === row.manage_id
      );

      if (!existingBook) {
        // 새로 생성할 도서
        createList.push({
          ...row,
          rental_info: {
            rent_available: true,
            rent_date: null,
            return_date: null,
            expected_return_date: null,
            user_name: "",
            user_email: "",
          },
          img_url: "",
        });
      } else {
        // 업데이트할 도서
        if (
          existingBook.title !== row.title ||
          existingBook.author !== row.author ||
          !IsSameDate(existingBook.reg_date, row.reg_date) ||
          existingBook.comments !== row.comments
        ) {
          updateList.push({
            ...existingBook,
            ...row,
          });
        }
      }
    }

    // 삭제할 도서 찾기
    for (const book of books) {
      const found = excelData.find((row) => row.manage_id === book.manage_id);
      if (!found) {
        deleteList.push(book);
      }
    }

    setbooksToCreate(createList);
    setbooksToUpdate(updateList);
    setbooksToDelete(deleteList);

    setMessage(
      `분석 완료: 신규 ${createList.length}권, 수정 ${updateList.length}권, 삭제 ${deleteList.length}권`
    );
  }

  async function startFetch() {
    setLoading(true);
    setMessage("");

    try {
      const promises = [];

      if (booksToCreate.length > 0) {
        promises.push(
          fetch("/api/books/many", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booksToCreate),
          })
        );
      }

      if (booksToUpdate.length > 0) {
        promises.push(
          fetch("/api/books/many", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booksToUpdate),
          })
        );
      }

      if (booksToDelete.length > 0) {
        promises.push(
          fetch("/api/books/many", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booksToDelete),
          })
        );
      }

      const results = await Promise.all(promises);
      const hasError = results.some((res) => !res.ok);

      if (hasError) {
        setMessage("일부 작업에서 오류가 발생했습니다. 결과를 확인해주세요.");
      } else {
        setMessage("모든 변경사항이 성공적으로 적용되었습니다!");
        // 성공 후 상태 초기화
        setTimeout(() => {
          setbooksToCreate([]);
          setbooksToUpdate([]);
          setbooksToDelete([]);
          setUploadStep("upload");
          setFile("");
          if (fileRef.current) {
            fileRef.current.value = "";
          }
        }, 2000);
      }
    } catch (error) {
      setMessage("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const resetProcess = () => {
    setbooksToCreate([]);
    setbooksToUpdate([]);
    setbooksToDelete([]);
    setUploadStep("upload");
    setMessage("");
    setFile("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const hasChanges =
    booksToCreate.length > 0 ||
    booksToUpdate.length > 0 ||
    booksToDelete.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <FaFileExcel className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Excel 도서 일괄 등록</h1>
            <p className="text-emerald-100">
              Excel 파일을 통해 여러 도서를 한 번에 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div
            className={`flex items-center gap-2 ${
              uploadStep === "upload"
                ? "text-blue-600 font-semibold"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                uploadStep === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300"
              }`}
            >
              1
            </div>
            <span>파일 업로드</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className={`h-full transition-all duration-300 ${
                uploadStep !== "upload" ? "bg-blue-600" : "bg-gray-200"
              }`}
              style={{
                width:
                  uploadStep === "upload"
                    ? "0%"
                    : uploadStep === "review"
                    ? "50%"
                    : "100%",
              }}
            ></div>
          </div>
          <div
            className={`flex items-center gap-2 ${
              uploadStep === "review"
                ? "text-blue-600 font-semibold"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                uploadStep === "review"
                  ? "bg-blue-600 text-white"
                  : uploadStep === "process"
                  ? "bg-green-600 text-white"
                  : "bg-gray-300"
              }`}
            >
              2
            </div>
            <span>검토 및 적용</span>
          </div>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            message.includes("오류") || message.includes("실패")
              ? "bg-red-50 border-red-500 text-red-700"
              : message.includes("완료") || message.includes("성공")
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes("오류") || message.includes("실패") ? (
              <FaExclamationTriangle />
            ) : message.includes("완료") || message.includes("성공") ? (
              <FaCheckCircle />
            ) : (
              <FaInfoCircle />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* 파일 업로드 섹션 */}
      {uploadStep === "upload" && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <FaUpload className="text-emerald-600 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Excel 파일 업로드
              </h2>
              <p className="text-gray-600">
                GEUK 도서 리스트 형식의 Excel 파일을 선택해주세요
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaFileExcel className="text-emerald-500 text-2xl mb-2" />
                  <p className="text-sm text-emerald-700 font-medium">
                    클릭하여 파일 선택
                  </p>
                  <p className="text-xs text-emerald-600">Excel 파일 (.xlsx)</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={readFile}
                  value={file}
                  onClick={() => setFile("")}
                  className="hidden"
                />
              </label>
            </div>

            {isLoading && uploadStep === "process" && (
              <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600">
                <FaSpinner className="animate-spin" />
                <span>파일을 분석하는 중...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검토 및 적용 섹션 */}
      {uploadStep === "review" && (
        <div className="space-y-6">
          {/* 요약 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              변경사항 요약
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaPlus className="text-green-600" />
                  <span className="font-semibold text-green-800">
                    신규 등록
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {booksToCreate.length}권
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaEdit className="text-blue-600" />
                  <span className="font-semibold text-blue-800">정보 수정</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {booksToUpdate.length}권
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrash className="text-red-600" />
                  <span className="font-semibold text-red-800">삭제</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {booksToDelete.length}권
                </p>
              </div>
            </div>
          </div>

          {/* 작업 버튼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetProcess}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                다시 업로드
              </button>
              {hasChanges && (
                <button
                  onClick={startFetch}
                  disabled={isLoading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      적용 중...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      변경사항 적용
                    </>
                  )}
                </button>
              )}
            </div>
            {!hasChanges && (
              <p className="text-center text-gray-500 mt-4">
                변경할 내용이 없습니다.
              </p>
            )}
          </div>

          {/* 상세 변경사항 */}
          {booksToCreate.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <FaPlus />
                신규 등록 도서 ({booksToCreate.length}권)
              </h3>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={booksToCreate.map((x) => ({
                    id: x.manage_id,
                    manage_id: x.manage_id,
                    title: x.title,
                    author: x.author,
                    reg_date: getDateString(x.reg_date),
                    comments: x.comments,
                  }))}
                  columns={columns}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                />
              </Box>
            </div>
          )}

          {booksToUpdate.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <FaEdit />
                정보 수정 도서 ({booksToUpdate.length}권)
              </h3>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={booksToUpdate.map((x) => ({
                    id: x.manage_id,
                    manage_id: x.manage_id,
                    title: x.title,
                    author: x.author,
                    reg_date: getDateString(x.reg_date),
                    comments: x.comments,
                  }))}
                  columns={columns}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                />
              </Box>
            </div>
          )}

          {booksToDelete.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <FaTrash />
                삭제 예정 도서 ({booksToDelete.length}권)
              </h3>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={booksToDelete.map((x) => ({
                    id: x.manage_id,
                    manage_id: x.manage_id,
                    title: x.title,
                    author: x.author,
                    reg_date: getDateString(x.reg_date),
                    comments: x.comments,
                  }))}
                  columns={columns}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                />
              </Box>
            </div>
          )}
        </div>
      )}

      {/* 도움말 섹션 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FaFileExcel className="text-blue-600" />
          Excel 파일 형식 안내
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">필수 컬럼:</h4>
            <ul className="space-y-1">
              <li>• No. (도서번호) - 4자리 숫자</li>
              <li>• Title (책 제목)</li>
              <li>• Author (저자)</li>
              <li>• Released Date (등록일)</li>
              <li>• Note (코멘트) - 선택사항</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">주의사항:</h4>
            <ul className="space-y-1">
              <li>• 시트명: "GEUK 도서 리스트"</li>
              <li>• 파일 형식: .xlsx 또는 .xls</li>
              <li>• 도서번호는 중복될 수 없습니다</li>
              <li>• 날짜 형식: YYYY-MM-DD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const columns: GridColDef[] = [
  {
    field: "manage_id",
    headerName: "도서번호",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "title",
    headerName: "제목",
    width: 250,
    headerAlign: "center",
  },
  {
    field: "author",
    headerName: "저자",
    width: 150,
    headerAlign: "center",
  },
  {
    field: "reg_date",
    headerName: "등록일",
    width: 120,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "comments",
    headerName: "코멘트",
    width: 200,
    headerAlign: "center",
  },
];

const schema = {
  "No.": {
    prop: "manage_id",
    type: String,
    required: true,
  },
  Title: {
    prop: "title",
    type: String,
    required: true,
  },
  Author: {
    prop: "author",
    type: String,
    required: true,
  },
  "Released Date": {
    prop: "reg_date",
    type: Date,
  },
  Note: {
    prop: "comments",
    type: String,
    default: "",
  },
};
