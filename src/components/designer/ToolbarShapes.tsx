import { motion } from "framer-motion";
import { Square, Circle, Triangle, Minus, Star, Heart } from "lucide-react";
import type { DesignElement } from "./types";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface Props {
  onAdd: (el: Omit<DesignElement, "id" | "zIndex">) => void;
}

const SHAPES = [
  { type: "rect" as const, icon: Square, label: "Rectangle" },
  { type: "circle" as const, icon: Circle, label: "Circle" },
  { type: "triangle" as const, icon: Triangle, label: "Triangle" },
  { type: "star" as const, icon: Star, label: "Star" },
  { type: "heart" as const, icon: Heart, label: "Heart" },
  { type: "line" as const, icon: Minus, label: "Line" },
];

export default function ToolbarShapes({ onAdd }: Props) {
  const [color, setColor] = useState("#338eb8");
  const [size, setSize] = useState(60);

  const addShape = (shapeType: "rect" | "circle" | "triangle" | "line" | "star" | "heart") => {
    onAdd({
      type: "shape",
      x: 40,
      y: 80,
      width: shapeType === "line" ? size * 1.5 : size,
      height: shapeType === "line" ? 2 : size,
      rotation: 0,
      shapeType,
      fill: shapeType === "line" ? undefined : color,
      stroke: shapeType === "line" ? color : undefined,
      strokeWidth: shapeType === "line" ? 3 : 0,
      opacity: 1,
      locked: false,
      visible: true,
      name: SHAPES.find(s => s.type === shapeType)?.label || "Shape",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {SHAPES.map((shape) => (
          <motion.button
            key={shape.type}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => addShape(shape.type)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30"
          >
            <shape.icon className="h-6 w-6 text-foreground" style={{ color }} />
            <span className="font-body text-[10px] font-semibold text-muted-foreground">{shape.label}</span>
          </motion.button>
        ))}
      </div>

      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Color</p>
        <div className="flex gap-2 items-center">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
          <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 rounded-lg" placeholder="#338eb8" />
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Size: {size}px</p>
        <Slider value={[size]} onValueChange={([v]) => setSize(v)} min={20} max={150} step={5} />
      </div>
    </div>
  );
}
