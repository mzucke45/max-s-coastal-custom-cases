import { useState } from "react";
import { LayoutDashboard, Package, Layers, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCollections from "@/components/admin/AdminCollections";
import AdminOrders from "@/components/admin/AdminOrders";

type Tab = "dashboard" | "products" | "collections" | "orders";

const Admin = () => {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem("admin_password"));
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "collections", label: "Collections", icon: Layers },
    { id: "orders", label: "Orders", icon: ShoppingCart },
  ];

  const logout = () => {
    localStorage.removeItem("admin_password");
    setAuthed(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border p-4 flex flex-col">
        <h1 className="font-display text-lg font-semibold mb-6 px-2">Admin</h1>
        <nav className="space-y-1 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <Button variant="ghost" onClick={logout} className="justify-start gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "collections" && <AdminCollections />}
        {activeTab === "orders" && <AdminOrders />}
      </main>
    </div>
  );
};

export default Admin;
