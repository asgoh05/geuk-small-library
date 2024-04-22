import { IBook } from "../(models)/Book";
import { PieChart } from "@mui/x-charts";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { RemainingDays } from "../(general)/datetime";

interface IDatagridRow {
  id: String;
  title: String;
  user_name: String;
  rent_date: String;
  remaining_days: Number;
}

interface RentalInfoModalProps {
  books: Array<IBook>;
  toggleModal: () => void;
}

export default function RentalInfoModal({
  books,
  toggleModal,
}: RentalInfoModalProps) {
  const bookAvailable = books.filter((book) => book.rental_info.rent_available);
  const bookRental = books.filter(
    (book) =>
      !book.rental_info.rent_available &&
      (RemainingDays(
        new Date(book.rental_info.expected_return_date)
      ) as number) >= 0
  );
  const bookOverdue = books.filter(
    (book) =>
      !book.rental_info.rent_available &&
      (RemainingDays(
        new Date(book.rental_info.expected_return_date)
      ) as number) < 0
  );

  const rows = books
    .filter((book) => !book.rental_info.rent_available)
    .map((book) => {
      return {
        id: book.manage_id,
        title: book.title,
        user_name: book.rental_info.user_name,
        rent_date: book.rental_info.rent_date.toString().split("T")[0],
        remaining_days: RemainingDays(
          new Date(book.rental_info.expected_return_date)
        ),
      } as IDatagridRow;
    });

  const columns: GridColDef<IDatagridRow>[] = [
    { field: "id", headerName: "ID", width: 160 },
    {
      field: "title",
      headerName: "Book Title",
      width: 150,
    },
    {
      field: "user_name",
      headerName: "User Name",
      width: 150,
    },
    {
      field: "rent_date",
      headerName: "대여일",
      width: 100,
    },
    {
      field: "remaining_days",
      headerName: "남은 반납 기간",
      align: "center",
      width: 100,
    },
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl flex justify-center items-center z-10">
      <div className="fixed p-4 bg-white shadow-lg py-2 rounded-md">
        <div className="text-sm font-medium text-gray-900 border-b border-gray-300 py-3 px-4 mb-4 flex justify-center">
          <p className="text-md">모든 대여정보</p>
        </div>
        <div className="main">
          <div className="flex flex-col w-full h-full gap-3 justify-center items-center">
            <div className="relative right-8 w-full">
              <PieChart
                colors={["#b2e061", "#ffb55a", "#fd7f6f"]}
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: bookAvailable.length,
                        label: `대여 가능 (${bookAvailable.length})`,
                      },
                      {
                        id: 1,
                        value: bookRental.length,
                        label: `대여중 (${bookRental.length})`,
                      },
                      {
                        id: 2,
                        value: bookOverdue.length,
                        label: `연체중 (${bookOverdue.length})`,
                      },
                    ],
                    innerRadius: 40,
                    outerRadius: 60,
                    cornerRadius: 5,
                  },
                ]}
                width={400}
                height={200}
              />
            </div>
            <div className="hidden lg:block">
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Box>
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
