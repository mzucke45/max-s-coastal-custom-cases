import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw, Trash2, Download } from "lucide-react";

const COLORS = [
  "#ffffff", "#f8f4f0", "#1a1a2e", "#16213e", "#0f3460",
  "#e94560", "#533483", "#2b2d42", "#8d99ae", "#edf2f4",
  "#d4a373", "#ccd5ae", "#e9edc9", "#fefae0", "#faedcd",
];

interface Props {
  bgColor: string;
  onBgChange: (c: string) => void;
  scale: number;
  onScaleChange: (s: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  // selected element color
  selectedFill?: string;
  selectedStroke?: string;
  selectedStrokeWidth?: number;
  onSelectedFillChange?: (c: string) => void;
  onSelectedStrokeChange?: (c: string) => void;
  onSelectedStrokeWidthChange?: (w: number) => void;
  hasSelection: boolean;
}

export default function ToolbarCanvas({
  bgColor, onBgChange, scale, onScaleChange,
  canUndo, canRedo, onUndo, onRedo, onClear, onExport,
  selectedFill, selectedStroke, selectedStrokeWidth,
  onSelectedFillChange, onSelectedStrokeChange, onSelectedStrokeWidthChange,
  hasSelection,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Undo/Redo/Zoom */}
      <div>
        <h3 className="font-body font-medium text-sm mb-2">Canvas Controls</h3>
        <div className="flex gap-1 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1 h-8" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-8" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="h-3.5 w-3.5" /> Redo
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onScaleChange(Math.min(2, scale + 0.1))}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onScaleChange(Math.max(0.5, scale - 0.1))}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => onScaleChange(1)}>
            <RotateCcw className="h-3.5 w-3.5" /> {Math.round(scale * 100)}%
          </Button>
        </div>
      </div>

      {/* Background */}
      <div>
        <h3 className="font-body font-medium text-sm mb-2">Background Color</h3>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onBgChange(c)}
              className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                bgColor === c ? "border-primary scale-105 shadow-md" : "border-border"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input type="color" value={bgColor} onChange={(e) => onBgChange(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
          <Input value={bgColor} onChange={(e) => onBgChange(e.target.value)} className="flex-1" placeholder="#ffffff" />
        </div>
      </div>

      {/* Selected element fill/stroke */}
      {hasSelection && (
        <div>
          <h3 className="font-body font-medium text-sm mb-2">Element Color</h3>
          <div className="space-y-2">
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Fill</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={selectedFill || "#000000"} onChange={(e) => onSelectedFillChange?.(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={selectedFill || ""} onChange={(e) => onSelectedFillChange?.(e.target.value)} className="flex-1" placeholder="#000000" />
              </div>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Stroke</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={selectedStroke || "#000000"} onChange={(e) => onSelectedStrokeChange?.(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Slider value={[selectedStrokeWidth || 0]} onValueChange={([v]) => onSelectedStrokeWidthChange?.(v)} min={0} max={10} step={1} className="flex-1" />
                <span className="text-xs font-body text-muted-foreground w-6">{selectedStrokeWidth || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={onClear}>
          <Trash2 className="h-4 w-4" /> Clear All
        </Button>
        <Button className="flex-1 gap-2" onClick={onExport}>
          <Download className="h-4 w-4" /> Export PNG
        </Button>
      </div>
    </div>
  );
}
