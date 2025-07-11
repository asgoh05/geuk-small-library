"use client";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  FaUsers,
  FaUserShield,
  FaUserTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEye,
  FaChartBar,
} from "react-icons/fa";

interface IUser {
  _id: string;
  real_name: string;
  email: string;
  company_email: string;
  registered_at: string;
  banned: boolean;
  admin: boolean;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const showMessage = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        showMessage("사용자 목록을 불러오는데 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showMessage("서버 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: "ban" | "unban" | "make_admin" | "remove_admin",
    userName: string
  ) => {
    let actionText = "";
    let warningMessage = "";

    switch (action) {
      case "ban":
        actionText = "강제 탈퇴";
        warningMessage = `${userName} 사용자를 강제 탈퇴시키시겠습니까?\n\n이 사용자는 더 이상 도서관을 이용할 수 없습니다.`;
        break;
      case "unban":
        actionText = "복구";
        warningMessage = `${userName} 사용자를 복구하시겠습니까?\n\n이 사용자가 다시 도서관을 이용할 수 있게 됩니다.`;
        break;
      case "make_admin":
        actionText = "관리자 권한 부여";
        warningMessage = `${userName} 사용자에게 관리자 권한을 부여하시겠습니까?\n\n이 사용자가 모든 관리 기능에 접근할 수 있게 됩니다.`;
        break;
      case "remove_admin":
        actionText = "관리자 권한 제거";
        warningMessage = `${userName} 사용자의 관리자 권한을 제거하시겠습니까?\n\n이 사용자는 더 이상 관리 기능에 접근할 수 없습니다.`;
        break;
    }

    if (!confirm(warningMessage)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          action: action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, "success");
        fetchUsers(); // 목록 새로고침
      } else {
        showMessage(data.message || "작업 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage("서버 오류가 발생했습니다.", "error");
    }
  };

  const columns: GridColDef<IUser>[] = [
    {
      field: "real_name",
      headerName: "실명",
      width: 120,
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "개인 이메일",
      width: 220,
      headerAlign: "center",
    },
    {
      field: "company_email",
      headerName: "회사 이메일",
      width: 220,
      headerAlign: "center",
    },
    {
      field: "registered_at",
      headerName: "가입일",
      width: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (params) => {
        return new Date(params).toLocaleDateString("ko-KR");
      },
    },
    {
      field: "banned",
      headerName: "상태",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {params.value ? "탈퇴" : "정상"}
        </span>
      ),
    },
    {
      field: "admin",
      headerName: "관리자",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value ? "관리자" : "일반"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "관리",
      width: 280,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        const user = params.row;
        return (
          <div className="flex gap-1">
            {user.banned ? (
              <button
                onClick={() =>
                  handleUserAction(user._id, "unban", user.real_name)
                }
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors duration-200"
              >
                복구
              </button>
            ) : (
              <button
                onClick={() =>
                  handleUserAction(user._id, "ban", user.real_name)
                }
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200"
              >
                강제탈퇴
              </button>
            )}
            {user.admin ? (
              <button
                onClick={() =>
                  handleUserAction(user._id, "remove_admin", user.real_name)
                }
                className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors duration-200"
              >
                관리자해제
              </button>
            ) : (
              <button
                onClick={() =>
                  handleUserAction(user._id, "make_admin", user.real_name)
                }
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200"
              >
                관리자권한
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner message="사용자 목록을 불러오는 중..." size="large" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.banned).length,
    banned: users.filter((u) => u.banned).length,
    admins: users.filter((u) => u.admin).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <FaUsers className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">사용자 관리</h1>
            <p className="text-indigo-100">
              등록된 사용자들의 권한과 상태를 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            messageType === "error"
              ? "bg-red-50 border-red-500 text-red-700"
              : messageType === "success"
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {messageType === "error" ? (
              <FaTimesCircle />
            ) : messageType === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaInfoCircle />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <FaUsers className="text-blue-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">전체 사용자</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}명</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">정상 사용자</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.active}명
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <FaUserTimes className="text-red-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">탈퇴 사용자</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.banned}명
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <FaUserShield className="text-purple-500 text-xl" />
            <div>
              <p className="text-sm text-gray-600">관리자</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.admins}명
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaChartBar className="text-indigo-600" />
          사용자 목록
        </h2>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#f8fafc",
                fontWeight: 600,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          />
        </Box>
      </div>

      {/* 안내 및 주의사항 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기능 안내 */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" />
            기능 안내
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • <strong>강제 탈퇴:</strong> 사용자의 도서관 이용을 차단합니다.
            </p>
            <p>
              • <strong>복구:</strong> 탈퇴된 사용자를 다시 활성화합니다.
            </p>
            <p>
              • <strong>관리자 권한:</strong> 사용자에게 관리자 권한을
              부여하거나 제거합니다.
            </p>
            <p>
              • <strong>자동 승인:</strong> 가입한 모든 사용자는 즉시 이용
              가능합니다.
            </p>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-600" />
            주의사항
          </h3>
          <div className="text-sm text-orange-800 space-y-2">
            <p>• 관리자 권한 변경 시 신중하게 결정하세요.</p>
            <p>• 강제 탈퇴된 사용자는 언제든 복구할 수 있습니다.</p>
            <p>• 자신의 계정에 대한 권한 변경은 불가능합니다.</p>
            <p>• 모든 작업은 즉시 적용되며 로그가 기록됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
