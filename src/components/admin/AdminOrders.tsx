import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Copy, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "paid", "submitted", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  submitted: "bg-sky-100 text-sky-800",
  processing: "bg-orange-100 text-orange-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

interface DesignElement {
  type: string;
  name: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  src?: string;
  shapeType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await adminApi.listOrders();
      setOrders(data || []);
    } catch {
      toast.error("Failed to load orders");
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
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.phone_model?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const copyGelatoSummary = (order: any) => {
    const designData = order.design_data || {};
    const firstCapture = Object.values(designData)[0] as any;
    const elements = firstCapture?.elements || [];
    const lines = [
      `Order: ${order.id}`,
      `Customer: ${order.customer_name} (${order.customer_email})`,
      `Phone Model: ${order.phone_model || "N/A"}`,
      `Status: ${order.status}`,
      `Total: $${Number(order.total_amount).toFixed(2)}`,
      ``,
      `Design Elements: ${elements.length}`,
      ...elements.map((el: any, i: number) => `  ${i + 1}. ${el.type} - "${el.name || el.text || el.shapeType || "element"}"`),
      ``,
      `Design Image: ${order.design_image_url || "N/A"}`,
      ``,
      `Shipping:`,
      order.shipping_address ? JSON.stringify(order.shipping_address, null, 2) : "N/A",
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied to clipboard");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground font-body">Loading orders...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Orders</h2>
        <span className="text-sm text-muted-foreground font-body">{filteredOrders.length} orders</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder="Search by name, email, model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs rounded-lg"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-muted-foreground font-body text-sm">
            {orders.length === 0 ? "No orders yet." : "No orders match your filters."}
          </div>
        )}
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-start gap-4">
              {order.design_image_url ? (
                <img
                  src={order.design_image_url}
                  alt="Design"
                  className="w-16 h-20 rounded-lg object-cover border border-border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedOrder(order)}
                />
              ) : (
                <div className="w-16 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-body font-semibold text-sm truncate">{order.customer_name || "Unknown"}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body truncate">{order.customer_email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                  {order.phone_model && <span>· {order.phone_model}</span>}
                  <span>· {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyGelatoSummary(order)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetail order={selectedOrder} onCopy={copyGelatoSummary} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function OrderDetail({ order, onCopy }: { order: any; onCopy: (o: any) => void }) {
  const designData = order.design_data || {};
  const firstCapture = Object.values(designData)[0] as any;
  const elements: DesignElement[] = firstCapture?.elements || [];
  const bgColor = firstCapture?.bgColor || "#ffffff";

  return (
    <div className="space-y-6 mt-2">
      {/* Design Preview */}
      <div className="flex gap-4">
        {order.design_image_url ? (
          <div className="relative group">
            <img
              src={order.design_image_url}
              alt="Design preview"
              className="w-40 h-56 rounded-xl object-cover border border-border"
            />
            <a
              href={order.design_image_url}
              download={`design-${order.id}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="w-40 h-56 rounded-xl bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-body">No design</span>
          </div>
        )}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-body text-muted-foreground">Customer</p>
            <p className="font-body font-semibold text-sm">{order.customer_name}</p>
            <p className="font-body text-xs text-muted-foreground">{order.customer_email}</p>
          </div>
          <div>
            <p className="text-xs font-body text-muted-foreground">Phone Model</p>
            <p className="font-body font-semibold text-sm">{order.phone_model || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-body text-muted-foreground">Total</p>
            <p className="font-body font-semibold text-sm">${Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-body text-muted-foreground">Date</p>
            <p className="font-body text-sm">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div>
          <p className="text-xs font-body font-semibold text-muted-foreground mb-2">Shipping Address</p>
          <div className="bg-muted/50 rounded-lg p-3 text-sm font-body">
            <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
            <p>{order.shipping_address.addressLine1}</p>
            {order.shipping_address.addressLine2 && <p>{order.shipping_address.addressLine2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postCode}</p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>
      )}

      {/* Design Elements Breakdown */}
      {elements.length > 0 && (
        <div>
          <p className="text-xs font-body font-semibold text-muted-foreground mb-2">
            Design Elements ({elements.length}) · BG: {bgColor}
          </p>
          <div className="space-y-1.5">
            {elements.map((el, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-2.5 text-xs font-body flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-card flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                  {el.type === "text" ? "T" : el.type === "image" ? "I" : el.type === "sticker" ? "S" : "◆"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{el.name || el.text || el.shapeType || el.type}</span>
                  {el.type === "text" && el.text && (
                    <span className="text-muted-foreground ml-2">"{el.text}" · {el.fontFamily} {el.fontSize}px · {el.fill}</span>
                  )}
                  {el.type === "shape" && (
                    <span className="text-muted-foreground ml-2">{el.shapeType} · {el.fill}</span>
                  )}
                </div>
                <span className="text-muted-foreground flex-shrink-0">
                  {Math.round(el.x)},{Math.round(el.y)} · {Math.round(el.width)}×{Math.round(el.height)}
                  {el.rotation ? ` · ${Math.round(el.rotation)}°` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <p className="text-xs font-body font-semibold text-muted-foreground mb-2">Order Items</p>
        <div className="space-y-1.5">
          {(Array.isArray(order.items) ? order.items : []).map((item: any, i: number) => (
            <div key={i} className="bg-muted/50 rounded-lg p-2.5 text-xs font-body flex justify-between">
              <span>{item.productName || item.productId} × {item.quantity || 1}</span>
              <span>{item.phoneModel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2 rounded-lg text-sm" onClick={() => onCopy(order)}>
          <Copy className="h-4 w-4" /> Copy for Gelato
        </Button>
        {order.design_image_url && (
          <a href={order.design_image_url} download={`design-${order.id}.png`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 rounded-lg text-sm">
              <Download className="h-4 w-4" /> Download PNG
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
