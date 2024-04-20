import AdminNav from "./components/AdminNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      <div className="w-3/4 py-12">
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
