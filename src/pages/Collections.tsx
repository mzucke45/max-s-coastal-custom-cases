import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, staggerItem } from "@/components/CoastalDecorations";

const Collections = () => {
  const { data: collections = [], isLoading } = useCollections();

  return (
    <PageTransition>
      <div className="min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-sky-deep font-semibold mb-3">Explore</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold">Collections</h1>
          </motion.div>

          <StaggerContainer className="max-w-4xl mx-auto space-y-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[21/9] rounded-3xl" />
              ))
            ) : collections.length === 0 ? (
              <p className="text-center text-muted-foreground font-body text-sm">No collections available yet.</p>
            ) : (
              collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/collections/${collection.id}`} className="group block">
                    <div className="relative overflow-hidden rounded-3xl aspect-[21/9] bg-muted shadow-md hover:shadow-xl transition-all duration-500">
                      {collection.image_url ? (
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">No image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/25 to-transparent flex items-center p-8 md:p-12">
                        <div className="max-w-sm">
                          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{collection.name}</h2>
                          <p className="text-white/70 font-body text-sm leading-relaxed">{collection.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  );
};

export default Collections;
