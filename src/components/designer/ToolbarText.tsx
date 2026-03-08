import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { DesignElement } from "./types";

const FONTS = [
  "DM Sans", "Cormorant Garamond", "Arial", "Georgia", "Courier New",
  "Verdana", "Impact", "Comic Sans MS", "Trebuchet MS", "Palatino",
];

interface Props {
  element: DesignElement | null;
  onChange: (attrs: Partial<DesignElement>) => void;
}

export default function ToolbarText({ element, onChange }: Props) {
  if (!element || element.type !== "text") {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground font-body">Select a text element to edit its properties</p>
      </div>
    );
  }

  const isBold = element.fontStyle?.includes("bold");
  const isItalic = element.fontStyle?.includes("italic");

  const toggleBold = () => {
    const current = element.fontStyle || "normal";
    if (isBold) {
      onChange({ fontStyle: current.replace("bold", "").trim() || "normal" });
    } else {
      onChange({ fontStyle: current === "normal" ? "bold" : `bold ${current}` });
    }
  };
  const toggleItalic = () => {
    const current = element.fontStyle || "normal";
    if (isItalic) {
      onChange({ fontStyle: current.replace("italic", "").trim() || "normal" });
    } else {
      onChange({ fontStyle: current === "normal" ? "italic" : `${current} italic` });
    }
  };
  const toggleUnderline = () => {
    onChange({ textDecoration: element.textDecoration === "underline" ? "" : "underline" });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-body font-medium text-sm">Text Properties</h3>

      {/* Editable text content */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Content</label>
        <Input value={element.text || ""} onChange={(e) => onChange({ text: e.target.value })} />
      </div>

      {/* Font family */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Font</label>
        <Select value={element.fontFamily || "DM Sans"} onValueChange={(v) => onChange({ fontFamily: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Size: {Math.round(element.fontSize || 20)}px</label>
        <Slider value={[element.fontSize || 20]} onValueChange={([v]) => onChange({ fontSize: v })} min={8} max={72} step={1} />
      </div>

      {/* Style buttons */}
      <div className="flex gap-1">
        <Button variant={isBold ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={toggleBold}><Bold className="h-3.5 w-3.5" /></Button>
        <Button variant={isItalic ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={toggleItalic}><Italic className="h-3.5 w-3.5" /></Button>
        <Button variant={element.textDecoration === "underline" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={toggleUnderline}><Underline className="h-3.5 w-3.5" /></Button>
        <div className="w-px bg-border mx-1" />
        <Button variant={element.align === "left" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => onChange({ align: "left" })}><AlignLeft className="h-3.5 w-3.5" /></Button>
        <Button variant={element.align === "center" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => onChange({ align: "center" })}><AlignCenter className="h-3.5 w-3.5" /></Button>
        <Button variant={element.align === "right" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => onChange({ align: "right" })}><AlignRight className="h-3.5 w-3.5" /></Button>
      </div>

      {/* Color */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Color</label>
        <div className="flex gap-2 items-center">
          <input type="color" value={element.fill || "#000000"} onChange={(e) => onChange({ fill: e.target.value })} className="w-8 h-8 rounded border border-border cursor-pointer" />
          <Input value={element.fill || "#000000"} onChange={(e) => onChange({ fill: e.target.value })} className="flex-1" />
        </div>
      </div>

      {/* Letter spacing */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Letter Spacing: {element.letterSpacing || 0}</label>
        <Slider value={[element.letterSpacing || 0]} onValueChange={([v]) => onChange({ letterSpacing: v })} min={-5} max={20} step={0.5} />
      </div>

      {/* Line height */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Line Height: {(element.lineHeight || 1.2).toFixed(1)}</label>
        <Slider value={[element.lineHeight || 1.2]} onValueChange={([v]) => onChange({ lineHeight: v })} min={0.8} max={3} step={0.1} />
      </div>
    </div>
  );
}
