import { Button } from "@/components/ui/button";
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown,
  ChevronsUp, ChevronsDown, AlignStartVertical, AlignCenterVertical,
  AlignEndVertical, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
} from "lucide-react";
import type { DesignElement } from "./types";

interface Props {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  phoneWidth: number;
  phoneHeight: number;
}

export default function ToolbarLayers({
  elements, selectedId, onSelect, onChange, onDelete, onReorder, phoneWidth, phoneHeight,
}: Props) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex); // top layer first in list
  const selected = elements.find((e) => e.id === selectedId);

  return (
    <div className="space-y-3">
      <h3 className="font-body font-medium text-sm">Layers & Arrange</h3>

      {/* Arrange buttons (when selected) */}
      {selected && (
        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => onReorder(selected.id, "top")}>
              <ChevronsUp className="h-3 w-3" /> Front
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => onReorder(selected.id, "up")}>
              <ArrowUp className="h-3 w-3" /> Forward
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => onReorder(selected.id, "down")}>
              <ArrowDown className="h-3 w-3" /> Backward
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => onReorder(selected.id, "bottom")}>
              <ChevronsDown className="h-3 w-3" /> Back
            </Button>
          </div>
          {/* Alignment */}
          <p className="font-body text-xs text-muted-foreground">Align to canvas</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" title="Align left" onClick={() => onChange(selected.id, { x: 0 })}>
              <AlignStartVertical className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" title="Center H" onClick={() => onChange(selected.id, { x: (phoneWidth - selected.width) / 2 })}>
              <AlignCenterVertical className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" title="Align right" onClick={() => onChange(selected.id, { x: phoneWidth - selected.width })}>
              <AlignEndVertical className="h-3 w-3" />
            </Button>
            <div className="w-px bg-border mx-0.5" />
            <Button variant="outline" size="icon" className="h-7 w-7" title="Align top" onClick={() => onChange(selected.id, { y: 0 })}>
              <AlignStartHorizontal className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" title="Center V" onClick={() => onChange(selected.id, { y: (phoneHeight - selected.height) / 2 })}>
              <AlignCenterHorizontal className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" title="Align bottom" onClick={() => onChange(selected.id, { y: phoneHeight - selected.height })}>
              <AlignEndHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Layer list */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground font-body py-4 text-center">No elements yet</p>
        )}
        {sorted.map((el) => (
          <div
            key={el.id}
            onClick={() => onSelect(el.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-body cursor-pointer transition-colors ${
              selectedId === el.id ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <span className="capitalize w-4 text-center">{el.type === "text" ? "T" : el.type === "image" ? "🖼" : "◆"}</span>
            <span className="flex-1 truncate">{el.name}</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onChange(el.id, { visible: !el.visible }); }}>
              {el.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onChange(el.id, { locked: !el.locked }); }}>
              {el.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
