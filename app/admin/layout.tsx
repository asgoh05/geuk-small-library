import AdminNav from "./components/AdminNav";
import AdminPasswordWrap from "./components/AdminPasswordWrap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      <AdminPasswordWrap>
        <div className="h-screen w-screen p-14">
          <AdminNav />
          {children}
        </div>
      </AdminPasswordWrap>
    </div>
  );
}
