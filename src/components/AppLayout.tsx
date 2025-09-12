
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  // Use try-catch to handle potential router context issues
  let isHomePage = false;
  try {
    const location = useLocation();
    isHomePage = location.pathname === "/";
  } catch (error) {
    console.error("Router context error:", error);
    // Default to false if there's an error
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-she-light via-white to-she-lavender/10">
      <Navbar />
      <main className={`flex-grow ${!isHomePage ? 'pt-20' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
