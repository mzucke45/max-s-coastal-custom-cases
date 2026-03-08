import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { DesignElement } from "./types";

const FONTS = [
  "Nunito", "Fredoka", "Arial", "Georgia", "Courier New",
  "Verdana", "Impact", "Comic Sans MS", "Trebuchet MS", "Palatino",
];

const COLOR_SWATCHES = [
  "#1a3a5c", "#338eb8", "#5bbfad", "#e87f6e", "#f5c542",
  "#ffffff", "#000000", "#deb887", "#2b2d42", "#e9edc9",
];

interface Props {
  onAdd: (el: Omit<DesignElement, "id" | "zIndex">) => void;
  element: DesignElement | null;
  onChange: (attrs: Partial<DesignElement>) => void;
}

export default function ToolbarText({ onAdd, element, onChange }: Props) {
  const [newText, setNewText] = useState("");

  const handleAddText = useCallback(() => {
    if (!newText.trim()) return;
    onAdd({
      type: "text",
      x: 30,
      y: 60,
      width: 140,
      height: 30,
      rotation: 0,
      text: newText,
      fontSize: 22,
      fontFamily: "Nunito",
      fontStyle: "normal",
      textDecoration: "",
      fill: "#1a3a5c",
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.2,
      locked: false,
      visible: true,
      name: newText.slice(0, 15),
    });
    setNewText("");
  }, [newText, onAdd]);

  const isEditing = element && element.type === "text";
  const isBold = element?.fontStyle?.includes("bold");
  const isItalic = element?.fontStyle?.includes("italic");

  const toggleBold = () => {
    if (!element) return;
    const current = element.fontStyle || "normal";
    onChange({ fontStyle: isBold ? (current.replace("bold", "").trim() || "normal") : (current === "normal" ? "bold" : `bold ${current}`) });
  };
  const toggleItalic = () => {
    if (!element) return;
    const current = element.fontStyle || "normal";
    onChange({ fontStyle: isItalic ? (current.replace("italic", "").trim() || "normal") : (current === "normal" ? "italic" : `${current} italic`) });
  };

  return (
    <div className="space-y-4">
      {/* Add new text */}
      <div className="flex gap-2">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddText()}
          placeholder="Type your text..."
          className="flex-1 rounded-xl"
        />
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button onClick={handleAddText} className="rounded-xl btn-squish" disabled={!newText.trim()}>Add</Button>
        </motion.div>
      </div>

      {/* Editing controls (visible when text selected) */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 pt-2 border-t border-border/50"
        >
          {/* Content */}
          <Input
            value={element.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            className="rounded-xl"
          />

          {/* Font picker */}
          <div className="flex flex-wrap gap-1.5">
            {FONTS.map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange({ fontFamily: f })}
                className={`px-2.5 py-1 rounded-lg text-xs font-body transition-all ${
                  element.fontFamily === f ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted text-muted-foreground"
                }`}
                style={{ fontFamily: f }}
              >
                {f}
              </motion.button>
            ))}
          </div>

          {/* Size */}
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Size: {Math.round(element.fontSize || 20)}px</p>
            <Slider value={[element.fontSize || 20]} onValueChange={([v]) => onChange({ fontSize: v })} min={8} max={72} step={1} />
          </div>

          {/* Style buttons */}
          <div className="flex gap-1 flex-wrap">
            <Button variant={isBold ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-lg" onClick={toggleBold}><Bold className="h-3.5 w-3.5" /></Button>
            <Button variant={isItalic ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-lg" onClick={toggleItalic}><Italic className="h-3.5 w-3.5" /></Button>
            <Button variant={element.textDecoration === "underline" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => onChange({ textDecoration: element.textDecoration === "underline" ? "" : "underline" })}><Underline className="h-3.5 w-3.5" /></Button>
            <div className="w-px bg-border mx-1" />
            <Button variant={element.align === "left" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => onChange({ align: "left" })}><AlignLeft className="h-3.5 w-3.5" /></Button>
            <Button variant={element.align === "center" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => onChange({ align: "center" })}><AlignCenter className="h-3.5 w-3.5" /></Button>
            <Button variant={element.align === "right" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => onChange({ align: "right" })}><AlignRight className="h-3.5 w-3.5" /></Button>
          </div>

          {/* Color swatches */}
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Color</p>
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_SWATCHES.map((c) => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => onChange({ fill: c })}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${
                    element.fill === c ? "border-primary scale-110" : "border-border/50"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input type="color" value={element.fill || "#000000"} onChange={(e) => onChange({ fill: e.target.value })} className="w-7 h-7 rounded-lg border border-border cursor-pointer" />
            </div>
          </div>

          {/* Spacing */}
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Letter Spacing: {element.letterSpacing || 0}</p>
            <Slider value={[element.letterSpacing || 0]} onValueChange={([v]) => onChange({ letterSpacing: v })} min={-5} max={20} step={0.5} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
