import { ReactNode, useState } from "react";
import Header from "../header/Header";
import Sidebar from "../header/sidebar/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[#FAF7F5] text-[#2A2421] antialiased font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F5]">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="max-w-[1360px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;