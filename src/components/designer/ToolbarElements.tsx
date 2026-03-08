import { useRef, useCallback } from "react";
import { Upload, Type, Square, Circle, Triangle, Minus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DesignElement } from "./types";

interface Props {
  onAdd: (el: Omit<DesignElement, "id" | "zIndex">) => void;
}

export default function ToolbarElements({ onAdd }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const w = 100;
        onAdd({
          type: "image",
          x: 30,
          y: 30,
          width: w,
          height: w / aspect,
          rotation: 0,
          src,
          opacity: 1,
          flipX: false,
          flipY: false,
          locked: false,
          visible: true,
          name: file.name.slice(0, 20),
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [onAdd]);

  const addText = () => {
    onAdd({
      type: "text",
      x: 30,
      y: 60,
      width: 120,
      height: 30,
      rotation: 0,
      text: "Your text",
      fontSize: 20,
      fontFamily: "DM Sans",
      fontStyle: "normal",
      textDecoration: "",
      fill: "#1a1a2e",
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.2,
      locked: false,
      visible: true,
      name: "Text",
    });
  };

  const addShape = (shapeType: "rect" | "circle" | "triangle" | "line") => {
    const names: Record<string, string> = { rect: "Rectangle", circle: "Circle", triangle: "Triangle", line: "Line" };
    onAdd({
      type: "shape",
      x: 40,
      y: 80,
      width: shapeType === "line" ? 80 : 60,
      height: shapeType === "line" ? 2 : 60,
      rotation: 0,
      shapeType,
      fill: shapeType === "line" ? undefined : "#2b2d42",
      stroke: shapeType === "line" ? "#2b2d42" : undefined,
      strokeWidth: shapeType === "line" ? 2 : 0,
      opacity: 1,
      locked: false,
      visible: true,
      name: names[shapeType],
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-body font-medium text-sm">Add Elements</h3>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
      <Button variant="outline" className="w-full justify-start gap-2" onClick={() => fileRef.current?.click()}>
        <Upload className="h-4 w-4" /> Upload Image
      </Button>
      <Button variant="outline" className="w-full justify-start gap-2" onClick={addText}>
        <Type className="h-4 w-4" /> Add Text
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="justify-start gap-2" onClick={() => addShape("rect")}>
          <Square className="h-4 w-4" /> Rect
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => addShape("circle")}>
          <Circle className="h-4 w-4" /> Circle
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => addShape("triangle")}>
          <Triangle className="h-4 w-4" /> Triangle
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => addShape("line")}>
          <Minus className="h-4 w-4" /> Line
        </Button>
      </div>
    </div>
  );
}
