import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

const SOLID_COLORS = [
  "#ffffff", "#f7f0e8", "#338eb8", "#1a3a5c", "#5bbfad",
  "#e87f6e", "#f5c542", "#deb887", "#c9d6df", "#2b2d42",
  "#e9edc9", "#fefae0", "#faedcd", "#d4a373", "#ccd5ae",
];

const GRADIENTS = [
  "linear-gradient(135deg, #338eb8, #5bbfad)",
  "linear-gradient(135deg, #e87f6e, #f5c542)",
  "linear-gradient(135deg, #1a3a5c, #338eb8)",
  "linear-gradient(135deg, #f7f0e8, #deb887)",
  "linear-gradient(135deg, #5bbfad, #ccd5ae)",
  "linear-gradient(135deg, #e87f6e, #338eb8)",
];

interface Props {
  bgColor: string;
  onBgChange: (c: string) => void;
}

export default function ToolbarBackground({ bgColor, onBgChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Solid colors */}
      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Solid Colors</p>
        <div className="grid grid-cols-5 gap-2">
          {SOLID_COLORS.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onBgChange(c)}
              className={`aspect-square rounded-xl border-2 transition-all shadow-sm ${
                bgColor === c ? "border-primary scale-110 shadow-md" : "border-border/50"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Gradients */}
      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Gradients</p>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENTS.map((g) => (
            <motion.button
              key={g}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onBgChange(g.match(/#[a-fA-F0-9]{6}/)?.[0] || "#338eb8")}
              className="aspect-[2/1] rounded-xl border-2 border-border/50 hover:border-primary transition-all shadow-sm"
              style={{ background: g }}
            />
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Custom</p>
        <div className="flex gap-2 items-center">
          <input type="color" value={bgColor} onChange={(e) => onBgChange(e.target.value)} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
          <Input value={bgColor} onChange={(e) => onBgChange(e.target.value)} className="flex-1 rounded-lg" placeholder="#ffffff" />
        </div>
      </div>
    </div>
  );
}
