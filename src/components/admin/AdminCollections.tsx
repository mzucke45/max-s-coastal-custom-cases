import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

const AdminCollections = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listCollections();
      setCollections(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: "", description: "", image_url: "", is_active: true });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, image_url: c.image_url, is_active: c.is_active });
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
      if (editing) {
        await adminApi.updateCollection({ id: editing.id, ...form });
        toast.success("Collection updated");
      } else {
        await adminApi.createCollection(form);
        toast.success("Collection created");
      }
      setDialogOpen(false);
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    try {
      await adminApi.deleteCollection(id);
      toast.success("Collection deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground font-body">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Collections</h2>
        <Button onClick={openCreate} className="rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Add Collection
        </Button>
      </div>

      <div className="grid gap-4">
        {collections.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
            {c.image_url && <img src={c.image_url} alt={c.name} className="w-16 h-16 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-body font-medium text-sm truncate">{c.name}</h3>
              <p className="text-xs text-muted-foreground font-body truncate">{c.description}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-body ${c.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
              {c.is_active ? "Active" : "Hidden"}
            </span>
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </motion.div>
        ))}
        {collections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-body text-sm">No collections yet.</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Collection" : "New Collection"}</DialogTitle>
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
            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Image</label>
              {form.image_url && (
                <div className="relative w-24 h-24 mb-2">
                  <img src={form.image_url} alt="" className="w-full h-full rounded-lg object-cover" />
                  <button onClick={() => setForm((f) => ({ ...f, image_url: "" }))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
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
              <span className="text-sm font-body">Active (visible on site)</span>
            </div>
            <Button onClick={handleSave} className="w-full rounded-lg h-11">{editing ? "Update" : "Create Collection"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCollections;
