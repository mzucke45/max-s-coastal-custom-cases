import { useState, useRef, useCallback, forwardRef } from "react";
import { motion } from "framer-motion";
import { Upload, ImagePlus } from "lucide-react";
import type { DesignElement } from "./types";

interface Props {
  onAdd: (el: Omit<DesignElement, "id" | "zIndex">) => void;
}

const ToolbarImage = forwardRef<HTMLDivElement, Props>(function ToolbarImage({ onAdd }, ref) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [recentImages, setRecentImages] = useState<string[]>([]);

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
        setRecentImages(prev => [src, ...prev.filter(s => s !== src)].slice(0, 6));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [onAdd]);

  const addRecentImage = (src: string) => {
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
        name: "Image",
      });
    };
    img.src = src;
  };

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

      {/* Upload zone */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-all"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <ImagePlus className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-body font-semibold text-sm text-foreground">Upload a photo</p>
          <p className="font-body text-xs text-muted-foreground">Drag & drop or click to browse</p>
        </div>
      </motion.button>

      {/* Recent images */}
      {recentImages.length > 0 && (
        <div>
          <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Recently uploaded</p>
          <div className="grid grid-cols-3 gap-2">
            {recentImages.map((src, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addRecentImage(src)}
                className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
