import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link2, Unlink, Pencil, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

const AdminGelatoProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUid, setEditUid] = useState("");
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [linkUid, setLinkUid] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await adminApi.listProducts();
      setProducts(p || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const linked = products.filter((p) => p.gelato_product_uid);
  const unlinked = products.filter((p) => !p.gelato_product_uid);

  const handleLink = async (productId: string, uid: string) => {
    if (!uid.trim()) { toast.error("Enter a Gelato Product UID"); return; }
    try {
      await adminApi.updateProduct({ id: productId, gelato_product_uid: uid.trim() });
      toast.success("Product linked to Gelato");
      setLinkingId(null);
      setLinkUid("");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUnlink = async (productId: string) => {
    if (!confirm("Remove Gelato link from this product?")) return;
    try {
      await adminApi.updateProduct({ id: productId, gelato_product_uid: null });
      toast.success("Gelato link removed");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEditSave = async (productId: string) => {
    if (!editUid.trim()) { toast.error("Enter a Gelato Product UID"); return; }
    try {
      await adminApi.updateProduct({ id: productId, gelato_product_uid: editUid.trim() });
      toast.success("Gelato UID updated");
      setEditingId(null);
      setEditUid("");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground font-body">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Gelato Products</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Link your site products to Gelato product UIDs for print-on-demand fulfillment.
        </p>
      </div>

      {/* Linked Products */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" /> Linked Products ({linked.length})
        </h3>
        {linked.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body py-4">No products linked yet.</p>
        ) : (
          <div className="grid gap-3">
            {linked.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
              >
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-body font-medium text-sm truncate">{product.name}</h4>
                  {editingId === product.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editUid}
                        onChange={(e) => setEditUid(e.target.value)}
                        placeholder="Gelato Product UID"
                        className="h-8 text-xs"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditSave(product.id)}>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {product.gelato_product_uid}
                    </p>
                  )}
                </div>
                {editingId !== product.id && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingId(product.id); setEditUid(product.gelato_product_uid); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleUnlink(product.id)}>
                      <Unlink className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Unlinked Products */}
      <div>
        <h3 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" /> Unlinked Products ({unlinked.length})
        </h3>
        {unlinked.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body py-4">All products are linked!</p>
        ) : (
          <div className="grid gap-3">
            {unlinked.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
              >
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-body font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-muted-foreground font-body">
                    ${Number(product.price).toFixed(2)} · {product.category}
                  </p>
                </div>
                {linkingId === product.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={linkUid}
                      onChange={(e) => setLinkUid(e.target.value)}
                      placeholder="Gelato Product UID"
                      className="h-8 text-xs w-48"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleLink(product.id, linkUid)}>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setLinkingId(null); setLinkUid(""); }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setLinkingId(product.id); setLinkUid(""); }}>
                    <Link2 className="h-3.5 w-3.5" /> Link
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGelatoProducts;
