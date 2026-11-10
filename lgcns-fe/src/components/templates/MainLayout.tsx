import { Outlet } from "react-router-dom";
import SiteHeader from "@/components/organisms/SiteHeader";

export default function MainLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  );
}
