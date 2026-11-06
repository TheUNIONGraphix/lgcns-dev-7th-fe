import AppHeader from "@/app/AppHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
