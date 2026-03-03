import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, phoneModels } from "@/data/products";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [selectedModel, setSelectedModel] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold mb-2">Product not found</h1>
          <Link to="/shop" className="text-primary underline font-body text-sm">Back to shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedModel) return;
    const model = phoneModels.find((m) => m.id === selectedModel);
    addItem({
      productId: product.id,
      productName: product.name,
      phoneModel: model?.name || selectedModel,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const brandGroups = phoneModels.reduce((acc, m) => {
    if (!acc[m.brand]) acc[m.brand] = [];
    acc[m.brand].push(m);
    return acc;
  }, {} as Record<string, typeof phoneModels>);

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-10 font-body text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-lg aspect-[3/4] bg-muted"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3 font-body">{product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">{product.name}</h1>
            <p className="text-muted-foreground font-body leading-relaxed mb-6">{product.description}</p>
            <p className="font-display text-2xl font-semibold text-foreground mb-8">${product.price}</p>

            <div className="space-y-4">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-2 block">Phone Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="rounded-full h-12">
                    <SelectValue placeholder="Select your phone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(brandGroups).map(([brand, models]) => (
                      <div key={brand}>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{brand}</div>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!selectedModel}
                className="w-full rounded-full h-12 text-sm font-medium tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {added ? (
                  <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Added to Cart</span>
                ) : (
                  "Add to Cart"
                )}
              </Button>

              {selectedModel && (
                <Link to="/designer" className="block">
                  <Button
                    variant="outline"
                    className="w-full rounded-full h-12 text-sm font-medium tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Customize This Design
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
