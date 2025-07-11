import AdminNav from "./components/AdminNav";
import AdminGuard from "./components/AdminGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      <AdminGuard>
        <div className="h-screen w-screen p-14">
          <AdminNav />
          {children}
        </div>
      </AdminGuard>
    </div>
  );
}
