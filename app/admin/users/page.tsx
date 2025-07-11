"use client";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface IUser {
  _id: string;
  real_name: string;
  email: string;
  registered_at: string;
  banned: boolean;
  admin: boolean;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setMessage("사용자 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("서버 오류가 발생했습니다.");
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
    switch (action) {
      case "ban":
        actionText = "강제 탈퇴";
        break;
      case "unban":
        actionText = "복구";
        break;
      case "make_admin":
        actionText = "관리자 권한 부여";
        break;
      case "remove_admin":
        actionText = "관리자 권한 제거";
        break;
    }

    if (!confirm(`${userName} 사용자를 ${actionText}하시겠습니까?`)) {
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
        setMessage(data.message);
        fetchUsers(); // 목록 새로고침
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "작업 중 오류가 발생했습니다.");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("서버 오류가 발생했습니다.");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const columns: GridColDef<IUser>[] = [
    {
      field: "real_name",
      headerName: "실명",
      width: 120,
    },
    {
      field: "email",
      headerName: "이메일",
      width: 250,
    },
    {
      field: "registered_at",
      headerName: "가입일",
      width: 120,
      valueGetter: (params) => {
        return new Date(params).toLocaleDateString("ko-KR");
      },
    },
    {
      field: "banned",
      headerName: "상태",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
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
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
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
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                복구
              </button>
            ) : (
              <button
                onClick={() =>
                  handleUserAction(user._id, "ban", user.real_name)
                }
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                강제탈퇴
              </button>
            )}
            {user.admin ? (
              <button
                onClick={() =>
                  handleUserAction(user._id, "remove_admin", user.real_name)
                }
                className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
              >
                관리자해제
              </button>
            ) : (
              <button
                onClick={() =>
                  handleUserAction(user._id, "make_admin", user.real_name)
                }
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
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
      <div className="min-h-screen">
        <LoadingSpinner message="사용자 목록을 불러오는 중..." size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">사용자 관리</h1>
        <p className="text-gray-600">
          전체 사용자: {users.length}명 | 정상 사용자:{" "}
          {users.filter((u) => !u.banned).length}명 | 탈퇴 사용자:{" "}
          {users.filter((u) => u.banned).length}명 | 관리자:{" "}
          {users.filter((u) => u.admin).length}명
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.includes("성공") || message.includes("되었습니다")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
      )}

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
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </Box>

      <div className="mt-6 text-sm text-gray-500">
        <p>• 강제 탈퇴: 사용자의 도서관 이용을 차단합니다.</p>
        <p>• 복구: 탈퇴된 사용자를 다시 활성화합니다.</p>
        <p>• 관리자 권한: 사용자에게 관리자 권한을 부여하거나 제거합니다.</p>
        <p>
          • 가입한 모든 사용자는 즉시 이용 가능하며, 문제가 있을 경우 강제
          탈퇴시킬 수 있습니다.
        </p>
      </div>
    </div>
  );
}
