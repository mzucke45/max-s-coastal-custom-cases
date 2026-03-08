import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, staggerItem } from "@/components/CoastalDecorations";

const CollectionDetail = () => {
  const { id } = useParams();
  const { data: collections = [], isLoading: loadingCollections } = useCollections();
  const { data: allProducts = [], isLoading: loadingProducts } = useProducts();

  const collection = collections.find((c) => c.id === id);
  const collectionProducts = allProducts.filter((p) => p.collection_id === id);

  if (loadingCollections || loadingProducts) {
    return (
      <div className="min-h-screen py-16 md:py-24 container mx-auto px-4">
        <Skeleton className="aspect-[21/9] rounded-2xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Collection not found</h1>
          <Link to="/collections" className="text-primary underline font-body text-sm">Back to collections</Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link to="/collections" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-10 font-body text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> All Collections
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14"
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[21/9] bg-muted mb-8 shadow-lg">
              {collection.image_url ? (
                <img src={collection.image_url} alt={collection.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/60 to-transparent flex items-end p-8 md:p-12">
                <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">{collection.name}</h1>
              </div>
            </div>
            <p className="text-muted-foreground font-body max-w-lg leading-relaxed">{collection.description}</p>
          </motion.div>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl">
            {collectionProducts.map((product) => (
              <motion.div key={product.id} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
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

          {collectionProducts.length === 0 && (
            <p className="text-muted-foreground font-body text-sm">No products in this collection yet.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CollectionDetail;
