import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { FlipHorizontal, FlipVertical } from "lucide-react";
import type { DesignElement } from "./types";

interface Props {
  element: DesignElement | null;
  onChange: (attrs: Partial<DesignElement>) => void;
}

export default function ToolbarImage({ element, onChange }: Props) {
  if (!element || element.type !== "image") {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground font-body">Select an image element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-body font-medium text-sm">Image Properties</h3>

      {/* Preview */}
      {element.src && (
        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <img src={element.src} alt="" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Opacity */}
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">Opacity: {Math.round((element.opacity ?? 1) * 100)}%</label>
        <Slider value={[(element.opacity ?? 1) * 100]} onValueChange={([v]) => onChange({ opacity: v / 100 })} min={0} max={100} step={1} />
      </div>

      {/* Flip */}
      <div className="flex gap-2">
        <Button variant={element.flipX ? "default" : "outline"} className="flex-1 gap-2" onClick={() => onChange({ flipX: !element.flipX })}>
          <FlipHorizontal className="h-4 w-4" /> Flip H
        </Button>
        <Button variant={element.flipY ? "default" : "outline"} className="flex-1 gap-2" onClick={() => onChange({ flipY: !element.flipY })}>
          <FlipVertical className="h-4 w-4" /> Flip V
        </Button>
      </div>

      {/* Fill/Stroke for shapes too */}
      {element.type === "image" && (
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">Border</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={element.stroke || "#000000"} onChange={(e) => onChange({ stroke: e.target.value })} className="w-8 h-8 rounded border border-border cursor-pointer" />
            <Slider value={[element.strokeWidth || 0]} onValueChange={([v]) => onChange({ strokeWidth: v })} min={0} max={10} step={1} className="flex-1" />
            <span className="text-xs font-body text-muted-foreground w-6">{element.strokeWidth || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
