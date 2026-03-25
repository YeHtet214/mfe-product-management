import {
  LayoutDashboard,
  ShoppingBag,
  History,
  User,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ShoppingBag, label: "Products", path: "/products" },
  { icon: History, label: "Audit Logs", path: "/audit-logs", permission: "portal.access" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { hasPermission } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                P
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Proudct</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {menuItems.map((item) => {
              if (item.permission && !hasPermission(item.permission)) {
                return null;
              }
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer/Logout */}
          <div className="p-4 border-t border-slate-800 shrink-0">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Support</p>
              <button className="text-sm text-slate-300 hover:text-white transition-colors">
                Help Center
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
