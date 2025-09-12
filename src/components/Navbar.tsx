import React, { useState, useEffect } from "react";
import { Menu, X, Calendar, Shield, ShoppingBag, BookOpen, UserCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use try-catch to handle potential router context issues
  let isHomePage = false;
  try {
    const location = useLocation();
    isHomePage = location.pathname === "/";
  } catch (error) {
    console.error("Router context error in Navbar:", error);
    // Default to false if there's an error
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? "glass-nav py-3" : isHomePage ? "bg-transparent py-5" : "glass-nav py-3"
      }`}
    >
      <div className="container mx-auto px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-she-purple font-semibold text-2xl">
            She<span className="text-she-indigo">sphere</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {isHomePage ? (
            <>
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#about">About</NavLink>
              <NavLink href="#contact">Contact</NavLink>
              <Button
                asChild
                className="bg-she-purple hover:bg-she-indigo text-white rounded-full px-6 transition-all duration-300"
              >
                <Link to="/login">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <AppNavLink to="/dashboard">Dashboard</AppNavLink>
              <AppNavLink to="/period-tracker">
                <Calendar size={16} className="mr-1" />
                Tracker
              </AppNavLink>
              <AppNavLink to="/safety">
                <Shield size={16} className="mr-1" />
                Safety
              </AppNavLink>
              <AppNavLink to="/shop">
                <ShoppingBag size={16} className="mr-1" />
                Shop
              </AppNavLink>
              <AppNavLink to="/resources">
                <BookOpen size={16} className="mr-1" />
                Resources
              </AppNavLink>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 text-she-dark hover:bg-she-lavender/30 hover:text-she-purple"
                asChild
              >
                <Link to="/profile">
                  <span className="sr-only">Profile</span>
                  <UserCircle size={20} />
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-she-dark"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card absolute top-full left-0 right-0 p-5 space-y-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            {isHomePage ? (
              <>
                <MobileNavLink href="#features" onClick={toggleMobileMenu}>
                  Features
                </MobileNavLink>
                <MobileNavLink href="#about" onClick={toggleMobileMenu}>
                  About
                </MobileNavLink>
                <MobileNavLink href="#contact" onClick={toggleMobileMenu}>
                  Contact
                </MobileNavLink>
                <Button asChild className="bg-she-purple hover:bg-she-indigo text-white rounded-full w-full transition-all duration-300 mt-2">
                  <Link to="/login" onClick={toggleMobileMenu}>Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <MobileAppNavLink to="/dashboard" onClick={toggleMobileMenu}>
                  Dashboard
                </MobileAppNavLink>
                <MobileAppNavLink to="/period-tracker" onClick={toggleMobileMenu}>
                  <Calendar size={16} className="mr-2" />
                  Period Tracker
                </MobileAppNavLink>
                <MobileAppNavLink to="/safety" onClick={toggleMobileMenu}>
                  <Shield size={16} className="mr-2" />
                  Safety Alerts
                </MobileAppNavLink>
                <MobileAppNavLink to="/shop" onClick={toggleMobileMenu}>
                  <ShoppingBag size={16} className="mr-2" />
                  Shop
                </MobileAppNavLink>
                <MobileAppNavLink to="/resources" onClick={toggleMobileMenu}>
                  <BookOpen size={16} className="mr-2" />
                  Resources
                </MobileAppNavLink>
                <MobileAppNavLink to="/profile" onClick={toggleMobileMenu}>
                  <UserCircle size={16} className="mr-2" />
                  My Profile
                </MobileAppNavLink>
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <Link 
                    to="/profile" 
                    className="flex items-center p-2 hover:bg-she-lavender/20 rounded-md transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <div className="h-8 w-8 rounded-full bg-she-lavender/30 flex items-center justify-center mr-3">
                      <span className="font-semibold text-she-purple">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-she-dark">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">sarah.j@example.com</p>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <a
    href={href}
    className="text-she-dark font-medium hover:text-she-purple transition-colors duration-300"
  >
    {children}
  </a>
);

interface AppNavLinkProps {
  to: string;
  children: React.ReactNode;
}

const AppNavLink = ({ to, children }: AppNavLinkProps) => {
  let isActive = false;
  try {
    const location = useLocation();
    isActive = location.pathname === to;
  } catch (error) {
    console.error("Router context error in AppNavLink:", error);
  }
  
  return (
    <Link
      to={to}
      className={`flex items-center font-medium transition-colors duration-300 ${
        isActive ? "text-she-purple" : "text-she-dark hover:text-she-purple"
      }`}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink = ({ href, children, onClick }: MobileNavLinkProps) => (
  <a
    href={href}
    className="text-she-dark font-medium block px-3 py-2 hover:bg-she-lavender/20 rounded-md transition-colors duration-300"
    onClick={onClick}
  >
    {children}
  </a>
);

interface MobileAppNavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}

const MobileAppNavLink = ({ to, children, onClick }: MobileAppNavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center font-medium px-3 py-2 rounded-md transition-colors duration-300 ${
        isActive 
          ? "bg-she-lavender/20 text-she-purple" 
          : "text-she-dark hover:bg-she-lavender/20 hover:text-she-purple"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;
