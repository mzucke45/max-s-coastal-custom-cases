import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Save, Loader2, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminApi } from "@/lib/adminApi";
import { PHONE_OUTLINES } from "@/components/designer/phoneOutlines";

interface MockupData {
  id?: string;
  model_id: string;
  back_image_url: string;
  overlay_image_url: string;
  case_area_x: number;
  case_area_y: number;
  case_area_width: number;
  case_area_height: number;
}

const DEFAULT_CASE_AREA = { case_area_x: 0.08, case_area_y: 0.04, case_area_width: 0.84, case_area_height: 0.92 };

const AdminMockups = () => {
  const [mockups, setMockups] = useState<Record<string, MockupData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const modelIds = Object.keys(PHONE_OUTLINES);

  useEffect(() => {
    adminApi.listMockups().then((data: MockupData[]) => {
      const map: Record<string, MockupData> = {};
      data.forEach((m) => { map[m.model_id] = m; });
      setMockups(map);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getMockup = (modelId: string): MockupData => {
    return mockups[modelId] || { model_id: modelId, back_image_url: "", overlay_image_url: "", ...DEFAULT_CASE_AREA };
  };

  const updateLocal = (modelId: string, patch: Partial<MockupData>) => {
    setMockups((prev) => ({
      ...prev,
      [modelId]: { ...getMockup(modelId), ...patch },
    }));
  };

  const handleUpload = async (modelId: string, field: "back_image_url" | "overlay_image_url") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(`${modelId}-${field}`);
      try {
        const result = await adminApi.uploadMockupImage(file);
        updateLocal(modelId, { [field]: result.url });
        toast.success("Image uploaded");
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleSave = async (modelId: string) => {
    setSaving(modelId);
    try {
      const data = getMockup(modelId);
      const result = await adminApi.upsertMockup(data);
      updateLocal(modelId, result);
      toast.success(`Saved mockup for ${PHONE_OUTLINES[modelId]?.label || modelId}`);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Phone Mockups</h2>
        <p className="text-sm text-muted-foreground">Upload back panel & camera overlay PNGs per model</p>
      </div>

      <div className="space-y-4">
        {modelIds.map((modelId, i) => {
          const outline = PHONE_OUTLINES[modelId];
          const data = getMockup(modelId);
          const hasImages = data.back_image_url || data.overlay_image_url;

          return (
            <motion.div
              key={modelId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`border rounded-xl p-4 ${hasImages ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-start gap-4">
                {/* Model info */}
                <div className="min-w-[140px]">
                  <p className="font-body font-semibold text-sm">{outline?.label || modelId}</p>
                  <p className="text-xs text-muted-foreground">{outline?.width}×{outline?.height}px</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{modelId}</p>
                </div>

                {/* Image columns */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Back image */}
                  <div>
                    <Label className="text-xs mb-1 block">Back Panel (bottom layer)</Label>
                    <div className="flex items-center gap-2">
                      {data.back_image_url ? (
                        <img src={data.back_image_url} alt="back" className="w-12 h-20 object-contain rounded border bg-muted" />
                      ) : (
                        <div className="w-12 h-20 rounded border border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        disabled={uploading === `${modelId}-back_image_url`}
                        onClick={() => handleUpload(modelId, "back_image_url")}
                      >
                        {uploading === `${modelId}-back_image_url` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        Upload
                      </Button>
                      {data.back_image_url && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateLocal(modelId, { back_image_url: "" })}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Overlay image */}
                  <div>
                    <Label className="text-xs mb-1 block">Camera Overlay (top layer, transparent)</Label>
                    <div className="flex items-center gap-2">
                      {data.overlay_image_url ? (
                        <img src={data.overlay_image_url} alt="overlay" className="w-12 h-20 object-contain rounded border bg-muted" />
                      ) : (
                        <div className="w-12 h-20 rounded border border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        disabled={uploading === `${modelId}-overlay_image_url`}
                        onClick={() => handleUpload(modelId, "overlay_image_url")}
                      >
                        {uploading === `${modelId}-overlay_image_url` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        Upload
                      </Button>
                      {data.overlay_image_url && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateLocal(modelId, { overlay_image_url: "" })}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Case area inputs */}
                <div className="grid grid-cols-2 gap-2 min-w-[180px]">
                  <div>
                    <Label className="text-[10px]">X offset %</Label>
                    <Input type="number" step="0.01" min="0" max="1" value={data.case_area_x} onChange={(e) => updateLocal(modelId, { case_area_x: +e.target.value })} className="h-7 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y offset %</Label>
                    <Input type="number" step="0.01" min="0" max="1" value={data.case_area_y} onChange={(e) => updateLocal(modelId, { case_area_y: +e.target.value })} className="h-7 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Width %</Label>
                    <Input type="number" step="0.01" min="0" max="1" value={data.case_area_width} onChange={(e) => updateLocal(modelId, { case_area_width: +e.target.value })} className="h-7 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Height %</Label>
                    <Input type="number" step="0.01" min="0" max="1" value={data.case_area_height} onChange={(e) => updateLocal(modelId, { case_area_height: +e.target.value })} className="h-7 text-xs" />
                  </div>
                </div>

                {/* Save */}
                <Button
                  size="sm"
                  className="gap-1 self-center"
                  disabled={saving === modelId}
                  onClick={() => handleSave(modelId)}
                >
                  {saving === modelId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMockups;
