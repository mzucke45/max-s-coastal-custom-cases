import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, ArrowLeft, ArrowRight, Check, Type, ImagePlus,
  Smile, Shapes, Palette, Layers, Undo2, Redo2, Download, Trash2, X, ChevronDown, Eye,
} from "lucide-react";
import Konva from "konva";
import { Button } from "@/components/ui/button";
import { phoneModels } from "@/data/products";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { PHONE_OUTLINES } from "@/components/designer/phoneOutlines";
import { usePhoneMockup } from "@/hooks/usePhoneMockups";
import { GELATO_PRODUCT_UIDS } from "@/components/designer/gelatoProductUids";
import type { DesignElement, ToolTab } from "@/components/designer/types";
import { useDesignerHistory } from "@/components/designer/useDesignerHistory";
import DesignerCanvas from "@/components/designer/DesignerCanvas";
import ToolbarText from "@/components/designer/ToolbarText";
import ToolbarImage from "@/components/designer/ToolbarImage";
import ToolbarStickers from "@/components/designer/ToolbarStickers";
import ToolbarShapes from "@/components/designer/ToolbarShapes";
import ToolbarBackground from "@/components/designer/ToolbarBackground";
import ToolbarLayers from "@/components/designer/ToolbarLayers";
import PageTransition from "@/components/PageTransition";
import { ConfettiBurst } from "@/components/CoastalDecorations";
import { ScrollArea } from "@/components/ui/scroll-area";
import MockupPreviewModal from "@/components/designer/MockupPreviewModal";
import { supabase } from "@/integrations/supabase/client";

type Step = "model" | "design" | "customize";

/* ──────── Series grouping helpers ──────── */
interface PhoneSeries {
  label: string;
  brand: string;
  models: typeof phoneModels;
}

function groupBySeries(models: typeof phoneModels): PhoneSeries[] {
  const seriesMap = new Map<string, PhoneSeries>();

  for (const m of models) {
    let seriesKey: string;
    if (m.brand === "Samsung") {
      seriesKey = "Samsung Galaxy";
    } else {
      // Extract series: "iPhone 16 Pro Max" → "iPhone 16 Series"
      const match = m.name.match(/^iPhone (\d+|X[SR]?)/i);
      seriesKey = match ? `iPhone ${match[1]} Series` : "Other";
    }

    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, { label: seriesKey, brand: m.brand, models: [] });
    }
    seriesMap.get(seriesKey)!.models.push(m);
  }

  return Array.from(seriesMap.values());
}

/* ──────── Component ──────── */
const Designer = () => {
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get("product") || "";
  const initialModel = searchParams.get("model") || "";

  const [step, setStep] = useState<Step>(initialModel ? (initialProduct ? "design" : "model") : "model");
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedDesign, setSelectedDesign] = useState<DbProduct | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ToolTab>("text");
  const [added, setAdded] = useState(false);
  const [scale, setScale] = useState(1);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMockupUrl, setPreviewMockupUrl] = useState<string | null>(null);
  const [previewDesignUrl, setPreviewDesignUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const stageRef = useRef<Konva.Stage | null>(null);
  const { data: products = [] } = useProducts();
  const { addItem } = useCart();

  const { current, push, undo, redo, canUndo, canRedo } = useDesignerHistory({
    elements: [],
    bgColor: "#ffffff",
  });

  const elements = current.elements;
  const bgColor = current.bgColor;
  const seriesGroups = useMemo(() => groupBySeries(phoneModels), []);

  useEffect(() => {
    if (initialProduct && products.length > 0 && !selectedDesign) {
      const found = products.find((p) => p.id === initialProduct);
      if (found) { setSelectedDesign(found); setStep("customize"); }
    }
  }, [initialProduct, products, selectedDesign]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          deleteElement(selectedId);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, undo, redo]);

  const phone = PHONE_OUTLINES[selectedModel];
  const { mockup } = usePhoneMockup(selectedModel || null);
  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  const setBgColor = useCallback((c: string) => { push({ ...current, bgColor: c }); }, [current, push]);

  const addElement = useCallback((partial: Omit<DesignElement, "id" | "zIndex">) => {
    const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const maxZ = current.elements.length > 0 ? Math.max(...current.elements.map((e) => e.zIndex)) : 0;
    const el: DesignElement = { ...partial, id, zIndex: maxZ + 1 } as DesignElement;
    push({ ...current, elements: [...current.elements, el] });
    setSelectedId(id);
    toast.success(`${el.type} added`);
  }, [current, push]);

  const updateElement = useCallback((id: string, attrs: Partial<DesignElement>) => {
    push({ ...current, elements: current.elements.map((e) => (e.id === id ? { ...e, ...attrs } : e)) });
  }, [current, push]);

  const deleteElement = useCallback((id: string) => {
    push({ ...current, elements: current.elements.filter((e) => e.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }, [current, push, selectedId]);

  const reorderElement = useCallback((id: string, direction: "up" | "down" | "top" | "bottom") => {
    const sorted = [...current.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const newSorted = [...sorted];
    if (direction === "top") { const [item] = newSorted.splice(idx, 1); newSorted.push(item); }
    else if (direction === "bottom") { const [item] = newSorted.splice(idx, 1); newSorted.unshift(item); }
    else if (direction === "up" && idx < newSorted.length - 1) { [newSorted[idx], newSorted[idx + 1]] = [newSorted[idx + 1], newSorted[idx]]; }
    else if (direction === "down" && idx > 0) { [newSorted[idx], newSorted[idx - 1]] = [newSorted[idx - 1], newSorted[idx]]; }
    push({ ...current, elements: newSorted.map((e, i) => ({ ...e, zIndex: i })) });
  }, [current, push]);

  const handleTransform = useCallback((id: string, attrs: Partial<DesignElement>) => {
    push({ ...current, elements: current.elements.map((e) => (e.id === id ? { ...e, ...attrs } : e)) });
  }, [current, push]);

  const clearAll = useCallback(() => { push({ elements: [], bgColor: "#ffffff" }); setSelectedId(null); }, [push]);

  const exportPng = useCallback(() => {
    if (!stageRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current?.toDataURL({ pixelRatio: 3 });
      if (!uri) return;
      const link = document.createElement("a");
      link.download = "phone-case-design.png";
      link.href = uri;
      link.click();
      toast.success("Design exported as PNG");
    }, 100);
  }, []);

  const handleAddToCart = () => {
    if (!selectedModel) return;
    const model = phoneModels.find((m) => m.id === selectedModel);

    // Capture design PNG
    let designPngDataUrl: string | undefined;
    if (stageRef.current) {
      setSelectedId(null);
      try {
        designPngDataUrl = stageRef.current.toDataURL({ pixelRatio: 3 });
      } catch { /* ignore export errors */ }
    }

    addItem({
      productId: selectedDesign?.id || "custom-design",
      productName: selectedDesign?.name || "Custom Design",
      phoneModel: model?.name || selectedModel,
      price: selectedDesign?.price || 34.99,
      image: designPngDataUrl || selectedDesign?.image_url || "",
      designCapture: {
        phoneModel: model?.name || selectedModel,
        elements: current.elements,
        bgColor: current.bgColor,
        designPngDataUrl,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success("Added to cart");
  };

  const handleSelectModel = (modelId: string) => { setSelectedModel(modelId); setStep("design"); };
  const handleSelectDesign = (product: DbProduct | null) => { setSelectedDesign(product); setStep("customize"); };

  /* ─── Preview My Case handler ─── */
  const handlePreviewCase = async () => {
    if (!selectedModel || !stageRef.current) return;

    const gelatoUid = GELATO_PRODUCT_UIDS[selectedModel];
    if (!gelatoUid) {
      toast.error("This model isn't configured yet");
      return;
    }

    setPreviewLoading(true);
    try {
      // 1. Export canvas as PNG
      setSelectedId(null);
      await new Promise((r) => setTimeout(r, 100)); // wait for deselect
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 3 });

      // 2. Convert data URL to blob and upload to storage
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("design-previews")
        .upload(fileName, blob, { contentType: "image/png", upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("design-previews")
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;
      setPreviewDesignUrl(publicUrl);

      // 3. Call generate-mockup edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const fnUrl = `https://${projectId}.supabase.co/functions/v1/generate-mockup`;

      const mockupRes = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          productUid: gelatoUid,
          designImageUrl: publicUrl,
        }),
      });

      if (!mockupRes.ok) {
        const errBody = await mockupRes.json().catch(() => ({}));
        if (mockupRes.status === 401) toast.error("Invalid Gelato API key — check your secrets");
        else if (mockupRes.status === 404) toast.error("Product UID not found in Gelato catalog");
        else toast.error(errBody.error || "Mockup generation failed — please try again");
        return;
      }

      const mockupData = await mockupRes.json();
      const mockupUrl = mockupData.mockupUrl;

      if (!mockupUrl) {
        console.warn("[Preview] No mockupUrl in response:", mockupData);
        toast.error("Gelato returned no mockup image — check Edge Function logs for details");
        return;
      }

      setPreviewMockupUrl(mockupUrl);
      setShowPreview(true);
    } catch (err: any) {
      console.error("[Preview] Error:", err);
      toast.error(err.message || "Failed to generate preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewPlaceOrder = () => {
    setShowPreview(false);
    handleAddToCart();
  };

  const TAB_ITEMS: { key: ToolTab; icon: typeof Type; label: string }[] = [
    { key: "text", icon: Type, label: "Text" },
    { key: "images", icon: ImagePlus, label: "Images" },
    { key: "stickers", icon: Smile, label: "Stickers" },
    { key: "shapes", icon: Shapes, label: "Shapes" },
    { key: "background", icon: Palette, label: "BG" },
    { key: "layers", icon: Layers, label: "Layers" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen py-16 md:py-24">
        <ConfettiBurst active={added} />
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-coral font-semibold mb-3">Create</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Design Your Own</h1>
            <p className="text-muted-foreground font-body max-w-md mx-auto text-sm leading-relaxed">
              Select your phone, pick a design, and customize with text, images, stickers, and more.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {(["model", "design", "customize"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (s === "model") setStep("model");
                    if (s === "design" && selectedModel) setStep("design");
                    if (s === "customize" && selectedModel) setStep("customize");
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-body font-semibold transition-all ${
                    step === s
                      ? "bg-sky-deep text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span>{i + 1}.</span>
                  {s === "model" ? "Phone" : s === "design" ? "Design" : "Customize"}
                </motion.button>
                {i < 2 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ─── STEP 1: Grouped Series Picker ─── */}
            {step === "model" && (
              <motion.div key="model" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto">
                <h2 className="font-display text-xl font-bold mb-8 text-center">Select Your Phone</h2>

                {/* Series cards — horizontal scroll on mobile */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {seriesGroups.map((series) => (
                    <motion.button
                      key={series.label}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExpandedSeries(expandedSeries === series.label ? null : series.label)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 font-body text-sm font-semibold transition-all ${
                        expandedSeries === series.label
                          ? "border-sky-deep bg-sky/15 text-sky-deep shadow-md"
                          : "border-border bg-card text-foreground hover:border-sky/40 hover:shadow-sm"
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      {series.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedSeries === series.label ? "rotate-180" : ""}`} />
                    </motion.button>
                  ))}
                </div>

                {/* Models within expanded series — slide-down reveal */}
                <AnimatePresence mode="wait">
                  {expandedSeries && (
                    <motion.div
                      key={expandedSeries}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="glass rounded-3xl p-6 mb-4">
                        <p className="font-body text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">{expandedSeries}</p>
                        <div className="flex flex-wrap gap-2">
                          {seriesGroups
                            .find((s) => s.label === expandedSeries)
                            ?.models.map((model) => (
                              <motion.button
                                key={model.id}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelectModel(model.id)}
                                className={`px-4 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                                  selectedModel === model.id
                                    ? "bg-sky-deep text-white shadow-md"
                                    : "bg-muted text-foreground hover:bg-sky/15 hover:text-sky-deep"
                                }`}
                              >
                                {model.name}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ─── STEP 2: Design Picker ─── */}
            {step === "design" && (
              <motion.div key="design" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <Button variant="ghost" size="sm" onClick={() => setStep("model")} className="gap-1 rounded-full">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <h2 className="font-display text-xl font-bold">Choose a Design</h2>
                  <Button variant="outline" size="sm" onClick={() => handleSelectDesign(null)} className="gap-1 rounded-full btn-squish">
                    Blank Canvas <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground font-body text-sm mb-4">No designs available yet.</p>
                    <Button variant="outline" className="rounded-full btn-squish" onClick={() => handleSelectDesign(null)}>Start with blank canvas</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product) => (
                      <motion.button
                        key={product.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectDesign(product)}
                        className="group text-left rounded-3xl overflow-hidden border-2 border-border hover:border-sky/40 transition-all hover:shadow-lg"
                      >
                        <div className="aspect-[3/4] bg-muted overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-body">No image</div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-body font-semibold text-sm truncate">{product.name}</p>
                          <p className="font-body text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── STEP 3: Customizer ─── */}
            {step === "customize" && phone && (
              <motion.div key="customize" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setStep("design")} className="gap-1 rounded-full">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <h2 className="font-display text-lg font-bold">{phone.label}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={undo} disabled={!canUndo}><Undo2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={redo} disabled={!canRedo}><Redo2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                {/* Canvas */}
                <div className="relative">
                  <DesignerCanvas
                    phone={phone}
                    phoneId={selectedModel}
                    elements={elements}
                    bgColor={bgColor}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onTransform={handleTransform}
designImageUrl={(() => {
                      const url = selectedDesign?.design_image_url?.trim() || undefined;
                      if (url) console.log("Base design URL from product data:", url);
                      return url;
                    })()}
                    stageRef={stageRef}
                    scale={scale}
                    mockup={mockup}
                  />
                  {selectedElement && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90"
                      onClick={() => deleteElement(selectedElement.id)}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>

                {/* Toolbar */}
                <div className="mt-4 space-y-3">
                  {/* Tab pills */}
                  <div className="flex gap-1 bg-card rounded-2xl p-1.5 overflow-x-auto border border-border/50 shadow-sm">
                    {TAB_ITEMS.map((tab) => (
                      <motion.button
                        key={tab.key}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                          activeTab === tab.key
                            ? "bg-sky-deep text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ScrollArea className="glass rounded-2xl p-4 max-h-[380px]">
                        {activeTab === "text" && (
                          <ToolbarText
                            onAdd={addElement}
                            element={selectedElement}
                            onChange={(attrs) => selectedId && updateElement(selectedId, attrs)}
                          />
                        )}
                        {activeTab === "images" && <ToolbarImage onAdd={addElement} />}
                        {activeTab === "stickers" && <ToolbarStickers onAdd={addElement} />}
                        {activeTab === "shapes" && <ToolbarShapes onAdd={addElement} />}
                        {activeTab === "background" && <ToolbarBackground bgColor={bgColor} onBgChange={setBgColor} />}
                        {activeTab === "layers" && (
                          <ToolbarLayers
                            elements={elements}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onChange={updateElement}
                            onDelete={deleteElement}
                            onReorder={reorderElement}
                          />
                        )}
                      </ScrollArea>
                    </motion.div>
                  </AnimatePresence>

                   {/* Bottom action bar */}
                   <div className="flex gap-2 flex-wrap">
                     <Button variant="outline" className="flex-1 gap-2 rounded-full btn-squish" onClick={clearAll}>
                       <Trash2 className="h-4 w-4" /> Clear
                     </Button>
                     <Button variant="outline" className="flex-1 gap-2 rounded-full btn-squish" onClick={exportPng}>
                       <Download className="h-4 w-4" /> Export PNG
                     </Button>
                     <Button
                       variant="outline"
                       className="flex-1 gap-2 rounded-full btn-squish border-sky-deep/30 text-sky-deep hover:bg-sky/10"
                       onClick={handlePreviewCase}
                       disabled={previewLoading}
                     >
                       {previewLoading ? (
                         <span className="flex items-center gap-1.5">
                           <span className="flex gap-0.5">
                             <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-sky-deep rounded-full inline-block" />
                             <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }} className="w-1.5 h-1.5 bg-sky-deep rounded-full inline-block" />
                             <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 bg-sky-deep rounded-full inline-block" />
                           </span>
                           Generating…
                         </span>
                       ) : (
                         <><Eye className="h-4 w-4" /> Preview</>
                       )}
                     </Button>
                     <Button className="flex-1 gap-2 rounded-full btn-squish shadow-lg shadow-sky-deep/20" onClick={handleAddToCart} disabled={added}>
                       {added ? <><Check className="h-4 w-4" /> Added</> : `Add · $${(selectedDesign?.price || 34.99).toFixed(2)}`}
                     </Button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Mockup Preview Modal */}
      <MockupPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        mockupUrl={previewMockupUrl || ""}
        modelName={phoneModels.find((m) => m.id === selectedModel)?.name || selectedModel}
        onPlaceOrder={handlePreviewPlaceOrder}
      />
    </PageTransition>
  );
};

export default Designer;
