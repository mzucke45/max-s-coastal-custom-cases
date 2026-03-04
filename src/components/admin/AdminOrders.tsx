import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/adminApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listOrders();
      setOrders(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      toast.success("Status updated");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground font-body">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6">Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-body text-sm">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg border border-border p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-body font-medium">{order.customer_name || "Unknown Customer"}</p>
                  <p className="text-sm text-muted-foreground font-body">{order.customer_email}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {new Date(order.created_at).toLocaleDateString()} · ${Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
                <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["pending", "submitted", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {order.gelato_order_id && (
                <p className="text-xs text-muted-foreground font-body">Gelato: {order.gelato_order_id}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
