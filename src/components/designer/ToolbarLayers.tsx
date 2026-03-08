import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown,
  ChevronsUp, ChevronsDown,
} from "lucide-react";
import type { DesignElement } from "./types";

interface Props {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
}

export default function ToolbarLayers({
  elements, selectedId, onSelect, onChange, onDelete, onReorder,
}: Props) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
  const selected = elements.find((e) => e.id === selectedId);

  const getTypeIcon = (el: DesignElement) => {
    if (el.type === "text") return "T";
    if (el.type === "sticker") return el.name?.slice(0, 1) || "S";
    if (el.type === "image") return "I";
    return "S";
  };

  return (
    <div className="space-y-3">
      {/* Arrange buttons */}
      {selected && (
        <div className="flex gap-1 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1 text-xs h-7 rounded-lg" onClick={() => onReorder(selected.id, "top")}>
            <ChevronsUp className="h-3 w-3" /> Front
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs h-7 rounded-lg" onClick={() => onReorder(selected.id, "up")}>
            <ArrowUp className="h-3 w-3" /> Fwd
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs h-7 rounded-lg" onClick={() => onReorder(selected.id, "down")}>
            <ArrowDown className="h-3 w-3" /> Back
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs h-7 rounded-lg" onClick={() => onReorder(selected.id, "bottom")}>
            <ChevronsDown className="h-3 w-3" /> Bottom
          </Button>
        </div>
      )}

      {/* Layer list */}
      <div className="space-y-1 max-h-[250px] overflow-y-auto">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground font-body py-4 text-center">No elements yet</p>
        )}
        {sorted.map((el) => (
          <motion.div
            key={el.id}
            layout
            onClick={() => onSelect(el.id)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-body cursor-pointer transition-all ${
              selectedId === el.id ? "bg-primary/10 text-foreground border border-primary/20" : "hover:bg-muted/60 text-muted-foreground border border-transparent"
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold">{getTypeIcon(el)}</span>
            <span className="flex-1 truncate font-medium">{el.name}</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onChange(el.id, { visible: !el.visible }); }}>
              {el.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onChange(el.id, { locked: !el.locked }); }}>
              {el.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
