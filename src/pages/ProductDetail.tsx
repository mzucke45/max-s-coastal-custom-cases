import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneModels } from "@/data/products";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfettiBurst } from "@/components/CoastalDecorations";
import PageTransition from "@/components/PageTransition";

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const [selectedModel, setSelectedModel] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 md:py-24 container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-[3/4] rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 rounded-full" />
            <Skeleton className="h-10 w-2/3 rounded-full" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Product not found</h1>
          <Link to="/shop" className="text-sky-deep underline font-body text-sm">Back to shop</Link>
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
      image: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const brandGroups = phoneModels.reduce((acc, m) => {
    if (!acc[m.brand]) acc[m.brand] = {};
    if (!acc[m.brand][m.series]) acc[m.brand][m.series] = [];
    acc[m.brand][m.series].push(m);
    return acc;
  }, {} as Record<string, Record<string, typeof phoneModels>>);

  return (
    <PageTransition>
      <div className="min-h-screen py-16 md:py-24">
        <ConfettiBurst active={added} />
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-10 font-body text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden rounded-3xl aspect-[3/4] bg-muted shadow-lg"
            >
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral mb-3 font-body">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">{product.description}</p>
              <p className="font-display text-2xl font-bold text-foreground mb-8">${Number(product.price).toFixed(2)}</p>

              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground font-medium mb-2 block">Phone Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="rounded-full h-12">
                      <SelectValue placeholder="Select your phone" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(brandGroups).map(([brand, models]) => (
                        <div key={brand}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{brand}</div>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedModel}
                  className="w-full rounded-full h-12 text-sm font-semibold tracking-wide btn-squish shadow-lg shadow-sky-deep/20"
                >
                  {added ? (
                    <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Added to Cart</span>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>

                {selectedModel && (
                  <Link to={`/designer?product=${product.id}&model=${selectedModel}`} className="block">
                    <Button variant="outline" className="w-full rounded-full h-12 text-sm font-semibold tracking-wide btn-squish">
                      Customize This Design
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
