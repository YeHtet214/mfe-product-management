import { Bell, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, login, isAuthenticated } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          {isAuthenticated ? (
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                {(user && user.name) ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-none">
                  {(user && user.name) ? user.name : "Loading..."}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-1">
                  {user ? user.role?.name : ""}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={login}
              className="text-blue-500 border border-primary btn-outline cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
            >
              Login
            </button>
          )}

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsProfileOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <a
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </a>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={async () => {
                    await logout();
                    setIsProfileOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
