import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
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
    setForm({ name: "", description: "", price: "", image_url: "", category: "", collection_id: "", gelato_product_uid: "", is_active: true });
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
      category: product.category,
      collection_id: product.collection_id || "",
      gelato_product_uid: product.gelato_product_uid || "",
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(files[0]);
      setForm((f) => ({ ...f, image_url: res.url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
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
            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Image</label>
              {form.image_url && (
                <div className="relative w-24 h-24 mb-2">
                  <img src={form.image_url} alt="" className="w-full h-full rounded-lg object-cover" />
                  <button onClick={() => setForm((f) => ({ ...f, image_url: "" }))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-body">{uploading ? "Uploading..." : "Upload Image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
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
