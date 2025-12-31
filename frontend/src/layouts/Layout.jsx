import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Car,
  Calendar,
  BarChart3,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Cars", path: "/cars", icon: Car },
    { name: "Rentals", path: "/rentals", icon: Calendar },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center z-30 relative sticky top-0">
        <span className="text-lg font-bold text-gray-900">RentManager</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar / Navigation */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 bg-white shadow-xl w-64 transform transition-transform duration-300 ease-in-out z-20 md:translate-x-0 md:static md:shadow-lg md:h-screen",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Desktop Logo */}
        <div className="p-5 border-b border-gray-100 hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">RentManager</h1>
        </div>

        {/* Mobile Close Area */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center md:hidden">
          <span className="text-lg font-bold text-gray-900">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3 md:p-4 flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-72px)] justify-between">
          <nav className="space-y-1.5 md:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 pt-3 md:pt-4">
            <div className="flex items-center px-3 md:px-4 py-2 md:py-3 mb-2">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 text-sm md:text-base shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="font-medium text-sm md:text-base">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-[calc(100vh-52px)] md:min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
