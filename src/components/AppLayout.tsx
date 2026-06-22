import { Link, useLocation } from "react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  Wallet,
  FileText,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Input Harian",
    icon: ClipboardList,
    children: [
      { path: "/transaksi", label: "Barang Keluar", icon: ShoppingCart },
      { path: "/operasional", label: "Operasional", icon: Wallet },
      { path: "/barang-masuk", label: "Barang Masuk", icon: Package },
      { path: "/lain-lain", label: "Lain-Lain", icon: FileText },
    ],
  },
  { path: "/laporan", label: "Laporan", icon: BarChart3 },
  {
    label: "Master Data",
    icon: Settings,
    children: [
      { path: "/produk", label: "Produk", icon: Package },
      { path: "/member", label: "Member", icon: Users },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Input Harian": true,
    "Master Data": true,
  });
  const location = useLocation();

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-blue-700">Laporan Harian</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            if ("children" in item) {
              const isExpanded = expandedMenus[item.label] ?? false;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && item.children &&
                    item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 ml-4 text-sm rounded-lg transition-colors ${
                          isActive(child.path)
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.label}
                      </Link>
                    ))}
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-800">Laporan Harian</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
