import AppHeader from "@/app/AppHeader";

export default function PostLayout({
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
