import { motion } from "framer-motion";
import { COASTAL_STICKERS } from "./stickerData";
import type { DesignElement } from "./types";

interface Props {
  onAdd: (el: Omit<DesignElement, "id" | "zIndex">) => void;
}

export default function ToolbarStickers({ onAdd }: Props) {
  const handleStickerClick = (sticker: typeof COASTAL_STICKERS[0]) => {
    onAdd({
      type: "sticker",
      x: 40,
      y: 60,
      width: 60,
      height: 60,
      rotation: 0,
      src: sticker.src,
      opacity: 1,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      name: sticker.name,
    });
  };

  return (
    <div className="space-y-3">
      <p className="font-body text-xs font-semibold text-muted-foreground">Coastal Stickers</p>
      <div className="grid grid-cols-4 gap-2">
        {COASTAL_STICKERS.map((sticker) => (
          <motion.button
            key={sticker.name}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9, rotate: [0, -10, 10, 0] }}
            onClick={() => handleStickerClick(sticker)}
            className="aspect-square rounded-xl bg-muted/50 hover:bg-primary/10 flex items-center justify-center text-2xl transition-colors border border-transparent hover:border-primary/30"
            title={sticker.name}
          >
            {sticker.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
