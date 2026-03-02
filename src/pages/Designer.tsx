import { motion } from "framer-motion";
import { Upload, Type, Palette, Sticker, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneModels } from "@/data/products";

const Designer = () => {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Design Your Own Case ✨</h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Create something totally unique. Upload images, add text, pick colors — make it yours!
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Phone model selector */}
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <label className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Phone Model
              </label>
              <Select>
                <SelectTrigger className="rounded-full h-10">
                  <SelectValue placeholder="Select phone" />
                </SelectTrigger>
                <SelectContent>
                  {phoneModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tools */}
            {[
              { icon: Upload, label: "Upload Image", desc: "Add your own photos or graphics", emoji: "📸" },
              { icon: Type, label: "Add Text", desc: "Custom text with different fonts", emoji: "✍️" },
              { icon: Palette, label: "Background Color", desc: "Pick a base color for your case", emoji: "🎨" },
              { icon: Sticker, label: "Stickers", desc: "Fun stickers and emojis", emoji: "⭐" },
            ].map((tool, i) => (
              <motion.div
                key={tool.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <button className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border text-left hover:border-primary/50 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.emoji}</span>
                    <div>
                      <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">{tool.label}</h3>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Canvas area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center min-h-[500px] p-8"
          >
            <div className="text-6xl mb-6 animate-float">📱</div>
            <h3 className="font-display text-xl font-bold mb-2 text-center">Your Canvas</h3>
            <p className="text-muted-foreground font-body text-sm text-center max-w-sm mb-6">
              The full interactive designer is coming soon! Use the tools on the left to start imagining your custom case.
            </p>
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              🚧 Coming Soon — Full Designer
            </div>
          </motion.div>
        </div>

        {/* Pricing note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground font-body text-sm">
            Custom cases start at <span className="font-bold text-primary">$34.99</span> • Free shipping on orders over $50
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Designer;
