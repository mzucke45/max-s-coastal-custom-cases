import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, ArrowLeft, ArrowRight, Check, Type, ImagePlus,
  Smile, Shapes, Palette, Layers, Undo2, Redo2, Download, Trash2, X,
} from "lucide-react";
import Konva from "konva";
import { Button } from "@/components/ui/button";
import { phoneModels } from "@/data/products";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { PHONE_OUTLINES } from "@/components/designer/phoneOutlines";
import type { DesignElement, ToolTab, HistoryState } from "@/components/designer/types";
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

type Step = "model" | "design" | "customize";

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

  const stageRef = useRef<Konva.Stage | null>(null);
  const { data: products = [] } = useProducts();
  const { addItem } = useCart();

  const { current, push, undo, redo, canUndo, canRedo } = useDesignerHistory({
    elements: [],
    bgColor: "#ffffff",
  });

  const elements = current.elements;
  const bgColor = current.bgColor;

  useEffect(() => {
    if (initialProduct && products.length > 0 && !selectedDesign) {
      const found = products.find((p) => p.id === initialProduct);
      if (found) {
        setSelectedDesign(found);
        setStep("customize");
      }
    }
  }, [initialProduct, products, selectedDesign]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
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
  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  const setElements = useCallback((updater: (prev: DesignElement[]) => DesignElement[]) => {
    const newElements = updater(current.elements);
    push({ ...current, elements: newElements });
  }, [current, push]);

  const setBgColor = useCallback((c: string) => {
    push({ ...current, bgColor: c });
  }, [current, push]);

  const addElement = useCallback((partial: Omit<DesignElement, "id" | "zIndex">) => {
    const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const maxZ = current.elements.length > 0 ? Math.max(...current.elements.map((e) => e.zIndex)) : 0;
    const el: DesignElement = { ...partial, id, zIndex: maxZ + 1 } as DesignElement;
    push({ ...current, elements: [...current.elements, el] });
    setSelectedId(id);
    toast.success(`${el.type} added`);
  }, [current, push]);

  const updateElement = useCallback((id: string, attrs: Partial<DesignElement>) => {
    const newElements = current.elements.map((e) => (e.id === id ? { ...e, ...attrs } : e));
    push({ ...current, elements: newElements });
  }, [current, push]);

  const deleteElement = useCallback((id: string) => {
    push({ ...current, elements: current.elements.filter((e) => e.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }, [current, push, selectedId]);

  const reorderElement = useCallback((id: string, direction: "up" | "down" | "top" | "bottom") => {
    const sorted = [...current.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1) return;
    let newSorted = [...sorted];
    if (direction === "top") { const [item] = newSorted.splice(idx, 1); newSorted.push(item); }
    else if (direction === "bottom") { const [item] = newSorted.splice(idx, 1); newSorted.unshift(item); }
    else if (direction === "up" && idx < newSorted.length - 1) { [newSorted[idx], newSorted[idx + 1]] = [newSorted[idx + 1], newSorted[idx]]; }
    else if (direction === "down" && idx > 0) { [newSorted[idx], newSorted[idx - 1]] = [newSorted[idx - 1], newSorted[idx]]; }
    push({ ...current, elements: newSorted.map((e, i) => ({ ...e, zIndex: i })) });
  }, [current, push]);

  const handleTransform = useCallback((id: string, attrs: Partial<DesignElement>) => {
    const newElements = current.elements.map((e) => (e.id === id ? { ...e, ...attrs } : e));
    push({ ...current, elements: newElements });
  }, [current, push]);

  const clearAll = useCallback(() => {
    push({ elements: [], bgColor: "#ffffff" });
    setSelectedId(null);
  }, [push]);

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
    addItem({
      productId: selectedDesign?.id || "custom-design",
      productName: selectedDesign?.name || "Custom Design",
      phoneModel: model?.name || selectedModel,
      price: selectedDesign?.price || 34.99,
      image: selectedDesign?.image_url || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success("Added to cart");
  };

  const brandGroups = phoneModels.reduce((acc, m) => {
    if (!acc[m.brand]) acc[m.brand] = [];
    acc[m.brand].push(m);
    return acc;
  }, {} as Record<string, typeof phoneModels>);

  const handleSelectModel = (modelId: string) => { setSelectedModel(modelId); setStep("design"); };
  const handleSelectDesign = (product: DbProduct | null) => { setSelectedDesign(product); setStep("customize"); };

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-coral font-bold mb-3">Create</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Design Your Own</h1>
            <p className="text-muted-foreground font-body max-w-md mx-auto text-sm leading-relaxed">
              Select your phone, pick a design, and customize with text, images, stickers, and more.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["model", "design", "customize"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (s === "model") setStep("model");
                    if (s === "design" && selectedModel) setStep("design");
                    if (s === "customize" && selectedModel) setStep("customize");
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-body font-bold transition-all ${
                    step === s ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-accent"
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
            {/* STEP 1 */}
            {step === "model" && (
              <motion.div key="model" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto">
                <h2 className="font-display text-xl font-bold mb-6 text-center">Select Your Phone Model</h2>
                <div className="space-y-6">
                  {Object.entries(brandGroups).map(([brand, models]) => (
                    <div key={brand}>
                      <h3 className="font-body text-xs uppercase tracking-wider text-primary font-bold mb-3">{brand}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {models.map((model) => (
                          <motion.button
                            key={model.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelectModel(model.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                              selectedModel === model.id ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"
                            }`}
                          >
                            <Smartphone className="h-4 w-4 text-primary mb-1.5" />
                            <p className="font-body font-semibold text-xs">{model.name}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === "design" && (
              <motion.div key="design" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <motion.button
                        key={product.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectDesign(product)}
                        className="group text-left rounded-2xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg"
                      >
                        <div className="aspect-[3/4] bg-muted overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-body">No image</div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-body font-bold text-sm truncate">{product.name}</p>
                          <p className="font-body text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3 */}
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

                {/* Canvas - centered */}
                <div className="relative">
                  <DesignerCanvas
                    phone={phone}
                    elements={elements}
                    bgColor={bgColor}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onTransform={handleTransform}
                    designImageUrl={selectedDesign?.image_url}
                    stageRef={stageRef}
                    scale={scale}
                  />

                  {/* Delete button floating over selected element */}
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
                  {/* Tab buttons */}
                  <div className="flex gap-1 bg-muted/60 rounded-2xl p-1.5 overflow-x-auto">
                    {TAB_ITEMS.map((tab) => (
                      <motion.button
                        key={tab.key}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                          activeTab === tab.key
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
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
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2 rounded-full btn-squish" onClick={clearAll}>
                      <Trash2 className="h-4 w-4" /> Clear
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 rounded-full btn-squish" onClick={exportPng}>
                      <Download className="h-4 w-4" /> Export PNG
                    </Button>
                    <Button className="flex-1 gap-2 rounded-full btn-squish shadow-lg shadow-primary/20" onClick={handleAddToCart} disabled={added}>
                      {added ? <><Check className="h-4 w-4" /> Added</> : `Add · $${(selectedDesign?.price || 34.99).toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Designer;
