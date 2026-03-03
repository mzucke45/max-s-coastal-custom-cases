import { motion } from "framer-motion";
import { Upload, Type, Palette, Layers, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneModels } from "@/data/products";

const Designer = () => {
  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Create</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-3">Design Your Own</h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto text-sm leading-relaxed">
            Build a case that's entirely yours. Upload images, add text, choose colors, and layer your design.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {/* Phone model selector */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5" /> Phone Model
              </label>
              <Select>
                <SelectTrigger className="rounded-full h-10 text-sm">
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
              { icon: Upload, label: "Upload Image", desc: "Add your own photos or graphics" },
              { icon: Type, label: "Add Text", desc: "Custom text and typography" },
              { icon: Palette, label: "Background", desc: "Set your base color" },
              { icon: Layers, label: "Overlays", desc: "Layer graphics and elements" },
            ].map((tool, i) => (
              <motion.div
                key={tool.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <button className="w-full bg-card rounded-lg p-4 border border-border text-left hover:border-primary/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div>
                      <h3 className="font-body font-medium text-sm group-hover:text-primary transition-colors">{tool.label}</h3>
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
            className="bg-card rounded-lg border border-dashed border-border flex flex-col items-center justify-center min-h-[500px] p-8"
          >
            <Smartphone className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h3 className="font-display text-xl font-semibold mb-2 text-center">Your Canvas</h3>
            <p className="text-muted-foreground font-body text-sm text-center max-w-sm mb-6 leading-relaxed">
              Select a phone model to begin. The interactive designer is being built — full customization tools coming soon.
            </p>
            <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-medium font-body tracking-wide">
              Coming Soon
            </span>
          </motion.div>
        </div>

        {/* Pricing note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-muted-foreground font-body text-sm">
            Custom cases start at <span className="font-medium text-foreground">$34.99</span> &middot; Free shipping on orders over $50
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Designer;
