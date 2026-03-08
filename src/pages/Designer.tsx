import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, ArrowLeft, ArrowRight, Check, Plus, Layers, Type, Palette,
  ImagePlus, Settings,
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
import ToolbarElements from "@/components/designer/ToolbarElements";
import ToolbarText from "@/components/designer/ToolbarText";
import ToolbarImage from "@/components/designer/ToolbarImage";
import ToolbarLayers from "@/components/designer/ToolbarLayers";
import ToolbarCanvas from "@/components/designer/ToolbarCanvas";
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
  const [activeTab, setActiveTab] = useState<ToolTab>("elements");
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

  // Auto-select design from URL
  useEffect(() => {
    if (initialProduct && products.length > 0 && !selectedDesign) {
      const found = products.find((p) => p.id === initialProduct);
      if (found) {
        setSelectedDesign(found);
        setStep("customize");
      }
    }
  }, [initialProduct, products, selectedDesign]);

  // Keyboard shortcuts
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

  // --- State mutators that record history ---
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
    if (direction === "top") {
      const [item] = newSorted.splice(idx, 1);
      newSorted.push(item);
    } else if (direction === "bottom") {
      const [item] = newSorted.splice(idx, 1);
      newSorted.unshift(item);
    } else if (direction === "up" && idx < newSorted.length - 1) {
      [newSorted[idx], newSorted[idx + 1]] = [newSorted[idx + 1], newSorted[idx]];
    } else if (direction === "down" && idx > 0) {
      [newSorted[idx], newSorted[idx - 1]] = [newSorted[idx - 1], newSorted[idx]];
    }
    const updated = newSorted.map((e, i) => ({ ...e, zIndex: i }));
    push({ ...current, elements: updated });
  }, [current, push]);

  const handleTransform = useCallback((id: string, attrs: Partial<DesignElement>) => {
    // Lightweight update without full history push on every drag tick
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

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setStep("design");
  };

  const handleSelectDesign = (product: DbProduct | null) => {
    setSelectedDesign(product);
    setStep("customize");
  };

  const TAB_ITEMS: { key: ToolTab; icon: typeof Plus; label: string }[] = [
    { key: "elements", icon: Plus, label: "Add" },
    { key: "text", icon: Type, label: "Text" },
    { key: "image", icon: ImagePlus, label: "Image" },
    { key: "layers", icon: Layers, label: "Layers" },
    { key: "canvas", icon: Settings, label: "Canvas" },
  ];

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Create</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-3">Design Your Own</h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto text-sm leading-relaxed">
            Select your phone, pick a design, and customize with text, images, shapes, and more.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(["model", "design", "customize"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s === "model") setStep("model");
                  if (s === "design" && selectedModel) setStep("design");
                  if (s === "customize" && selectedModel) setStep("customize");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                  step === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <span>{i + 1}.</span>
                {s === "model" ? "Phone" : s === "design" ? "Design" : "Customize"}
              </button>
              {i < 2 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Phone Model */}
          {step === "model" && (
            <motion.div key="model" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto">
              <h2 className="font-display text-xl font-semibold mb-6 text-center">Select Your Phone Model</h2>
              <div className="space-y-6">
                {Object.entries(brandGroups).map(([brand, models]) => (
                  <div key={brand}>
                    <h3 className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-3">{brand}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          className={`p-3 rounded-lg border text-left transition-all hover:border-primary/50 hover:shadow-sm ${
                            selectedModel === model.id ? "border-primary bg-primary/5" : "border-border bg-card"
                          }`}
                        >
                          <Smartphone className="h-4 w-4 text-muted-foreground mb-1.5" />
                          <p className="font-body font-medium text-xs">{model.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Browse Designs */}
          {step === "design" && (
            <motion.div key="design" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => setStep("model")} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <h2 className="font-display text-xl font-semibold">Choose a Design</h2>
                <Button variant="outline" size="sm" onClick={() => handleSelectDesign(null)} className="gap-1">
                  Blank Canvas <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground font-body text-sm mb-4">No designs available yet.</p>
                  <Button variant="outline" onClick={() => handleSelectDesign(null)}>Start with blank canvas</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <button key={product.id} onClick={() => handleSelectDesign(product)} className="group text-left rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-sm">
                      <div className="aspect-[3/4] bg-muted overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-body">No image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-body font-medium text-sm truncate">{product.name}</p>
                        <p className="font-body text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Customize */}
          {step === "customize" && phone && (
            <motion.div key="customize" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => setStep("design")} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <h2 className="font-display text-xl font-semibold">{phone.label}</h2>
                <Button onClick={handleAddToCart} disabled={added} className="rounded-full gap-2">
                  {added ? <><Check className="h-4 w-4" /> Added</> : "Add to Cart"}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                {/* Canvas */}
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

                {/* Toolbar */}
                <div className="space-y-4">
                  {/* Tab buttons */}
                  <div className="grid grid-cols-5 gap-1 bg-muted rounded-lg p-1">
                    {TAB_ITEMS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex flex-col items-center gap-0.5 py-2 rounded-md text-xs font-body font-medium transition-colors ${
                          activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <ScrollArea className="bg-card rounded-lg border border-border p-4 max-h-[480px]">
                    {activeTab === "elements" && <ToolbarElements onAdd={addElement} />}
                    {activeTab === "text" && <ToolbarText element={selectedElement} onChange={(attrs) => selectedId && updateElement(selectedId, attrs)} />}
                    {activeTab === "image" && <ToolbarImage element={selectedElement} onChange={(attrs) => selectedId && updateElement(selectedId, attrs)} />}
                    {activeTab === "layers" && (
                      <ToolbarLayers
                        elements={elements}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onChange={updateElement}
                        onDelete={deleteElement}
                        onReorder={reorderElement}
                        phoneWidth={phone.width}
                        phoneHeight={phone.height}
                      />
                    )}
                    {activeTab === "canvas" && (
                      <ToolbarCanvas
                        bgColor={bgColor}
                        onBgChange={setBgColor}
                        scale={scale}
                        onScaleChange={setScale}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={undo}
                        onRedo={redo}
                        onClear={clearAll}
                        onExport={exportPng}
                        hasSelection={!!selectedElement}
                        selectedFill={selectedElement?.fill}
                        selectedStroke={selectedElement?.stroke}
                        selectedStrokeWidth={selectedElement?.strokeWidth}
                        onSelectedFillChange={(c) => selectedId && updateElement(selectedId, { fill: c })}
                        onSelectedStrokeChange={(c) => selectedId && updateElement(selectedId, { stroke: c })}
                        onSelectedStrokeWidthChange={(w) => selectedId && updateElement(selectedId, { strokeWidth: w })}
                      />
                    )}
                  </ScrollArea>

                  {/* Price & Add to Cart */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-body text-sm text-muted-foreground">Price</span>
                      <span className="font-display text-xl font-semibold">${(selectedDesign?.price || 34.99).toFixed(2)}</span>
                    </div>
                    <Button onClick={handleAddToCart} disabled={added} className="w-full rounded-full h-12 text-sm font-medium tracking-wide">
                      {added ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Added to Cart</span> : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Designer;
