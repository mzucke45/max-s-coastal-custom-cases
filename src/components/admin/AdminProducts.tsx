import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  label: string;
  helperText: string;
  value: string;
  onChange: (url: string) => void;
  showResWarning?: boolean;
}

const ImageUploadField = ({ label, helperText, value, onChange, showResWarning }: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(files[0]);
      onChange(res.url);

      // Check resolution for design images
      if (showResWarning) {
        const img = new Image();
        img.onload = () => {
          if (img.width < 2400 || img.height < 2400) {
            toast.warning(`Image is ${img.width}×${img.height}px. Recommended: 2400×2400px+ for best print quality.`);
          }
        };
        img.src = res.url;
      }
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-sm font-body font-medium text-foreground">{label}</label>
        {showResWarning && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent><p className="text-xs max-w-[200px]">Recommended minimum 2400×2400px for high-quality printing</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className="text-xs text-muted-foreground font-body mb-2">{helperText}</p>
      {value && (
        <div className="relative w-24 h-24 mb-2">
          <img src={value} alt="" className="w-full h-full rounded-lg object-cover border border-border" />
          <button onClick={() => onChange("")} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors">
        <Upload className="h-4 w-4" />
        <span className="text-sm font-body">{uploading ? "Uploading..." : "Upload"}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    design_image_url: "",
    category: "",
    collection_id: "",
    gelato_product_uid: "",
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([adminApi.listProducts(), adminApi.listCollections()]);
      setProducts(p || []);
      setCollections(c || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", image_url: "", design_image_url: "", category: "", collection_id: "", gelato_product_uid: "", is_active: true });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image_url: product.image_url,
      design_image_url: product.design_image_url || "",
      category: product.category,
      collection_id: product.collection_id || "",
      gelato_product_uid: product.gelato_product_uid || "",
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        collection_id: form.collection_id || null,
        gelato_product_uid: form.gelato_product_uid || null,
      };
      if (editing) {
        await adminApi.updateProduct({ id: editing.id, ...payload });
        toast.success("Product updated");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Product created");
      }
      setDialogOpen(false);
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success("Product deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground font-body">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Products</h2>
        <Button onClick={openCreate} className="rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
          >
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-body font-medium text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground font-body">
                ${Number(product.price).toFixed(2)} · {product.category}
                {product.collections?.name && ` · ${product.collections.name}`}
              </p>
              <div className="flex gap-2 mt-1">
                {product.image_url && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Shop Photo ✓</span>}
                {product.design_image_url && <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky/10 text-sky-deep">Base Design ✓</span>}
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-body ${product.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
              {product.is_active ? "Active" : "Hidden"}
            </span>
            <Button variant="ghost" size="icon" onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </motion.div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-body text-sm">
            No products yet. Click "Add Product" to get started.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body text-muted-foreground mb-1 block">Price</label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-body text-muted-foreground mb-1 block">Category</label>
                <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Collection</label>
              <Select value={form.collection_id} onValueChange={(v) => setForm((f) => ({ ...f, collection_id: v }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Gelato Product UID</label>
              <Input value={form.gelato_product_uid} onChange={(e) => setForm((f) => ({ ...f, gelato_product_uid: e.target.value }))} placeholder="Optional" />
            </div>

            {/* ── Dual Image Upload Fields ── */}
            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">Images</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadField
                  label="Shop Photo"
                  helperText="Shown to customers while browsing the store"
                  value={form.image_url}
                  onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                />
                <ImageUploadField
                  label="Base Design (for Customizer)"
                  helperText="Loaded into the customizer as the starting design — not visible in the shop"
                  value={form.design_image_url}
                  onChange={(url) => setForm((f) => ({ ...f, design_image_url: url }))}
                  showResWarning
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <span className="text-sm font-body">Active (visible in shop)</span>
            </div>
            <Button onClick={handleSave} className="w-full rounded-lg h-11">{editing ? "Update Product" : "Create Product"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
