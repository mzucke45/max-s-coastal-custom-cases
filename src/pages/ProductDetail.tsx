import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);

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

  const buyUrl = (product as { buy_url?: string | null }).buy_url;
  const hasBuyUrl = typeof buyUrl === "string" && buyUrl.trim().length > 0;

  return (
    <PageTransition>
      <div className="min-h-screen py-16 md:py-24">
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

              {hasBuyUrl ? (
                <a href={buyUrl!} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full rounded-full h-12 text-sm font-semibold tracking-wide btn-squish shadow-lg shadow-sky-deep/20">
                    Buy Now <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Button
                  disabled
                  className="w-full rounded-full h-12 text-sm font-semibold tracking-wide"
                  title="Coming soon"
                >
                  Coming Soon
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
