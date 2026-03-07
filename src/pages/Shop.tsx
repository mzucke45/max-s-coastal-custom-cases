import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Shop = () => {
  const { data: products = [], isLoading } = useProducts();

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Browse</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold">All Designs</h1>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/4 mt-1" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground font-body text-sm">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/shop/${product.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="mt-3 px-1">
                    <h3 className="font-display font-semibold text-base">{product.name}</h3>
                    <p className="text-muted-foreground font-body text-sm">${Number(product.price).toFixed(2)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
