import AdminNav from "./components/AdminNav";
import AdminGuard from "./components/AdminGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="px-6 py-8 max-w-7xl mx-auto">{children}</div>
      </div>
    </AdminGuard>
  );
}
