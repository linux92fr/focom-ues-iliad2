import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import ScrollToTop from "./ScrollToTop";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <ScrollToTop />
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <PageHeader />
        <Outlet />
      </div>
    </div>
  );
}
