import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Upload, Type, Palette, ImagePlus, Check, ArrowLeft, ArrowRight,
  X, Plus, Minus, Move, RotateCw, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneModels } from "@/data/products";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

// Phone dimensions for outline rendering
const PHONE_OUTLINES: Record<string, { width: number; height: number; radius: number; label: string }> = {
  "iphone-15-pro-max": { width: 200, height: 420, radius: 40, label: "iPhone 15 Pro Max" },
  "iphone-15-pro": { width: 190, height: 400, radius: 38, label: "iPhone 15 Pro" },
  "iphone-15": { width: 190, height: 400, radius: 38, label: "iPhone 15" },
  "iphone-14": { width: 188, height: 395, radius: 36, label: "iPhone 14" },
  "samsung-s24-ultra": { width: 196, height: 418, radius: 28, label: "Galaxy S24 Ultra" },
  "samsung-s24": { width: 190, height: 400, radius: 30, label: "Galaxy S24" },
  "samsung-s23": { width: 188, height: 398, radius: 30, label: "Galaxy S23" },
  "pixel-8-pro": { width: 192, height: 410, radius: 32, label: "Pixel 8 Pro" },
  "pixel-8": { width: 188, height: 400, radius: 32, label: "Pixel 8" },
  "pixel-7": { width: 186, height: 396, radius: 30, label: "Pixel 7" },
};

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
}

interface ImageOverlay {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

type Step = "model" | "design" | "customize";

const COLORS = [
  "#ffffff", "#f8f4f0", "#1a1a2e", "#16213e", "#0f3460",
  "#e94560", "#533483", "#2b2d42", "#8d99ae", "#edf2f4",
  "#d4a373", "#ccd5ae", "#e9edc9", "#fefae0", "#faedcd",
];

const Designer = () => {
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get("product") || "";
  const initialModel = searchParams.get("model") || "";

  const [step, setStep] = useState<Step>(initialModel ? (initialProduct ? "design" : "model") : "model");
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedDesign, setSelectedDesign] = useState<DbProduct | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [newTextColor, setNewTextColor] = useState("#1a1a2e");
  const [newTextSize, setNewTextSize] = useState(20);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"designs" | "text" | "image" | "background">("designs");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useProducts();
  const { addItem } = useCart();

  // Auto-select design if coming from product page
  useEffect(() => {
    if (initialProduct && products.length > 0 && !selectedDesign) {
      const found = products.find((p) => p.id === initialProduct);
      if (found) {
        setSelectedDesign(found);
        setStep("customize");
      }
    }
  }, [initialProduct, products, selectedDesign]);

  const phone = PHONE_OUTLINES[selectedModel];

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setStep("design");
  };

  const handleSelectDesign = (product: DbProduct | null) => {
    setSelectedDesign(product);
    setStep("customize");
  };

  const handleAddText = () => {
    if (!newText.trim()) return;
    const overlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: newText,
      x: 50,
      y: 50,
      fontSize: newTextSize,
      color: newTextColor,
      rotation: 0,
    };
    setTextOverlays((prev) => [...prev, overlay]);
    setActiveOverlay(overlay.id);
    setNewText("");
    toast.success("Text added to design");
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const maxW = 120;
        const overlay: ImageOverlay = {
          id: `img-${Date.now()}`,
          src,
          x: 40,
          y: 40,
          width: maxW,
          height: maxW / aspect,
          rotation: 0,
        };
        setImageOverlays((prev) => [...prev, overlay]);
        setActiveOverlay(overlay.id);
        toast.success("Image added to design");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-uploaded
    e.target.value = "";
  }, []);

  const removeOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((t) => t.id !== id));
    setImageOverlays((prev) => prev.filter((i) => i.id !== id));
    if (activeOverlay === id) setActiveOverlay(null);
  };

  const moveOverlay = (id: string, dx: number, dy: number) => {
    setTextOverlays((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x: t.x + dx, y: t.y + dy } : t))
    );
    setImageOverlays((prev) =>
      prev.map((i) => (i.id === id ? { ...i, x: i.x + dx, y: i.y + dy } : i))
    );
  };

  const rotateOverlay = (id: string) => {
    setTextOverlays((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rotation: (t.rotation + 15) % 360 } : t))
    );
    setImageOverlays((prev) =>
      prev.map((i) => (i.id === id ? { ...i, rotation: (i.rotation + 15) % 360 } : i))
    );
  };

  const resizeImageOverlay = (id: string, scale: number) => {
    setImageOverlays((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, width: Math.max(30, i.width * scale), height: Math.max(30, i.height * scale) }
          : i
      )
    );
  };

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

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Create</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-3">Design Your Own</h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto text-sm leading-relaxed">
            Select your phone, pick a design, and customize it with text, images, and colors.
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
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
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
            <motion.div
              key="model"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="font-display text-xl font-semibold mb-6 text-center">Select Your Phone Model</h2>
              <div className="space-y-6">
                {Object.entries(brandGroups).map(([brand, models]) => (
                  <div key={brand}>
                    <h3 className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-3">{brand}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 hover:shadow-sm ${
                            selectedModel === model.id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <Smartphone className="h-5 w-5 text-muted-foreground mb-2" />
                          <p className="font-body font-medium text-sm">{model.name}</p>
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
            <motion.div
              key="design"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-5xl mx-auto"
            >
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
                  <Button variant="outline" onClick={() => handleSelectDesign(null)}>
                    Start with blank canvas
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectDesign(product)}
                      className="group text-left rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-sm"
                    >
                      <div className="aspect-[3/4] bg-muted overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-body">
                            No image
                          </div>
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
            <motion.div
              key="customize"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => setStep("design")} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <h2 className="font-display text-xl font-semibold">
                  Customizing for {phone.label}
                </h2>
                <Button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="rounded-full gap-2"
                >
                  {added ? <><Check className="h-4 w-4" /> Added</> : "Add to Cart"}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Phone Preview */}
                <div className="flex items-center justify-center bg-muted/30 rounded-lg p-8 min-h-[520px]">
                  <div
                    className="relative shadow-2xl"
                    style={{
                      width: phone.width,
                      height: phone.height,
                      borderRadius: phone.radius,
                      backgroundColor: bgColor,
                      border: "3px solid hsl(var(--border))",
                      overflow: "hidden",
                    }}
                  >
                    {/* Base design image */}
                    {selectedDesign?.image_url && (
                      <img
                        src={selectedDesign.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ borderRadius: phone.radius - 3 }}
                      />
                    )}

                    {/* Image overlays */}
                    {imageOverlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        onClick={() => setActiveOverlay(overlay.id)}
                        className={`absolute cursor-pointer ${
                          activeOverlay === overlay.id ? "ring-2 ring-primary ring-offset-1" : ""
                        }`}
                        style={{
                          left: overlay.x,
                          top: overlay.y,
                          width: overlay.width,
                          height: overlay.height,
                          transform: `rotate(${overlay.rotation}deg)`,
                        }}
                      >
                        <img
                          src={overlay.src}
                          alt=""
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                    ))}

                    {/* Text overlays */}
                    {textOverlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        onClick={() => setActiveOverlay(overlay.id)}
                        className={`absolute cursor-pointer select-none whitespace-nowrap font-body font-semibold ${
                          activeOverlay === overlay.id ? "ring-2 ring-primary ring-offset-1 rounded" : ""
                        }`}
                        style={{
                          left: overlay.x,
                          top: overlay.y,
                          fontSize: overlay.fontSize,
                          color: overlay.color,
                          transform: `rotate(${overlay.rotation}deg)`,
                        }}
                      >
                        {overlay.text}
                      </div>
                    ))}

                    {/* Camera cutout */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-foreground/10 rounded-full" />
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-4">
                  {/* Tab buttons */}
                  <div className="grid grid-cols-4 gap-1 bg-muted rounded-lg p-1">
                    {[
                      { key: "designs" as const, icon: ImagePlus, label: "Design" },
                      { key: "text" as const, icon: Type, label: "Text" },
                      { key: "image" as const, icon: Upload, label: "Image" },
                      { key: "background" as const, icon: Palette, label: "Color" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex flex-col items-center gap-0.5 py-2 rounded-md text-xs font-body font-medium transition-colors ${
                          activeTab === tab.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="bg-card rounded-lg border border-border p-4 min-h-[300px]">
                    {activeTab === "designs" && (
                      <div>
                        <h3 className="font-body font-medium text-sm mb-3">Pre-made Designs</h3>
                        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                          <button
                            onClick={() => setSelectedDesign(null)}
                            className={`aspect-square rounded-lg border-2 transition-colors flex items-center justify-center text-xs font-body ${
                              !selectedDesign ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                            }`}
                          >
                            None
                          </button>
                          {products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setSelectedDesign(p)}
                              className={`aspect-square rounded-lg border-2 overflow-hidden transition-colors ${
                                selectedDesign?.id === p.id ? "border-primary" : "border-border hover:border-primary/30"
                              }`}
                            >
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-body text-muted-foreground">{p.name}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "text" && (
                      <div className="space-y-4">
                        <h3 className="font-body font-medium text-sm">Add Text Overlay</h3>
                        <Input
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          placeholder="Type your text..."
                          onKeyDown={(e) => e.key === "Enter" && handleAddText()}
                        />
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">Text Color</label>
                          <div className="flex flex-wrap gap-2">
                            {COLORS.slice(0, 10).map((c) => (
                              <button
                                key={c}
                                onClick={() => setNewTextColor(c)}
                                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                  newTextColor === c ? "border-primary scale-110" : "border-border"
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">
                            Font Size: {newTextSize}px
                          </label>
                          <Slider
                            value={[newTextSize]}
                            onValueChange={([v]) => setNewTextSize(v)}
                            min={10}
                            max={48}
                            step={1}
                          />
                        </div>
                        <Button onClick={handleAddText} className="w-full rounded-lg gap-2" disabled={!newText.trim()}>
                          <Plus className="h-4 w-4" /> Add Text
                        </Button>
                      </div>
                    )}

                    {activeTab === "image" && (
                      <div className="space-y-4">
                        <h3 className="font-body font-medium text-sm">Upload Image Overlay</h3>
                        <p className="text-xs text-muted-foreground font-body">
                          Upload a photo or graphic to layer onto your design. Max 10MB.
                        </p>
                        {/* Native file input - works on all platforms */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full rounded-lg gap-2 h-20 border-dashed"
                        >
                          <Upload className="h-5 w-5" />
                          <span className="font-body">Tap to Upload Image</span>
                        </Button>
                        {imageOverlays.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-body text-xs text-muted-foreground">Uploaded Images</h4>
                            {imageOverlays.map((overlay) => (
                              <div key={overlay.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <img src={overlay.src} alt="" className="w-10 h-10 object-cover rounded" />
                                <span className="font-body text-xs flex-1 truncate">Image</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => removeOverlay(overlay.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "background" && (
                      <div className="space-y-4">
                        <h3 className="font-body font-medium text-sm">Background Color</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setBgColor(c)}
                              className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                                bgColor === c ? "border-primary scale-105 shadow-md" : "border-border"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">Custom Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                            />
                            <Input
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active overlay controls */}
                  {activeOverlay && (
                    <div className="bg-card rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-xs text-muted-foreground">Selected Element</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setActiveOverlay(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveOverlay(activeOverlay, -5, 0)}>
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveOverlay(activeOverlay, 5, 0)}>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveOverlay(activeOverlay, 0, -5)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveOverlay(activeOverlay, 0, 5)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => rotateOverlay(activeOverlay)}>
                          <RotateCw className="h-3 w-3" />
                        </Button>
                        {imageOverlays.some((i) => i.id === activeOverlay) && (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resizeImageOverlay(activeOverlay, 0.9)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resizeImageOverlay(activeOverlay, 1.1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button variant="destructive" size="icon" className="h-8 w-8 ml-auto" onClick={() => removeOverlay(activeOverlay)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Overlays list */}
                  {(textOverlays.length > 0 || imageOverlays.length > 0) && activeTab === "text" && (
                    <div className="bg-card rounded-lg border border-border p-3">
                      <h4 className="font-body text-xs text-muted-foreground mb-2">Text Layers</h4>
                      <div className="space-y-1">
                        {textOverlays.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setActiveOverlay(t.id)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              activeOverlay === t.id ? "bg-primary/10" : "hover:bg-muted"
                            }`}
                          >
                            <span className="font-body text-sm truncate" style={{ color: t.color }}>
                              {t.text}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeOverlay(t.id); }}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price & Add to Cart */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-body text-sm text-muted-foreground">Price</span>
                      <span className="font-display text-xl font-semibold">
                        ${(selectedDesign?.price || 34.99).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleAddToCart}
                      disabled={added}
                      className="w-full rounded-full h-12 text-sm font-medium tracking-wide"
                    >
                      {added ? (
                        <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Added to Cart</span>
                      ) : (
                        "Add to Cart"
                      )}
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
