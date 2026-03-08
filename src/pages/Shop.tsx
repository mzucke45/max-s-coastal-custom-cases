import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, staggerItem } from "@/components/CoastalDecorations";

const Shop = () => {
  const { data: products = [], isLoading } = useProducts();

  return (
    <PageTransition>
      <div className="min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-coral font-bold mb-3">Browse</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold">All Designs</h1>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 mt-3 rounded-full" />
                  <Skeleton className="h-3 w-1/4 mt-1 rounded-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground font-body text-sm">No products available yet.</p>
          ) : (
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/shop/${product.id}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted shadow-md hover:shadow-xl transition-shadow duration-500">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">No image</div>
                      )}
                    </div>
                    <div className="mt-3 px-1">
                      <h3 className="font-display font-bold text-base">{product.name}</h3>
                      <p className="text-muted-foreground font-body text-sm">${Number(product.price).toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Shop;
