import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingCart, Layers } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCollections: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground font-body">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-muted-foreground font-body">Failed to load stats</div>;

  const cards = [
    { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-600" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "text-purple-600" },
    { label: "Collections", value: stats.totalCollections, icon: Layers, color: "text-orange-600" },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-lg border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-sm text-muted-foreground font-body">{card.label}</span>
            </div>
            <p className="font-display text-2xl font-semibold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-body text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-body font-medium text-sm">{order.customer_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground font-body">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-body font-medium text-sm">${Number(order.total_amount).toFixed(2)}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-body bg-accent text-accent-foreground capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
