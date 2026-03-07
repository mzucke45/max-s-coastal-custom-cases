import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";

const Collections = () => {
  const { data: collections = [], isLoading } = useCollections();

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Explore</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold">Collections</h1>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[21/9] rounded-lg" />
            ))
          ) : collections.length === 0 ? (
            <p className="text-center text-muted-foreground font-body text-sm">No collections available yet.</p>
          ) : (
            collections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/collections/${collection.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg aspect-[21/9] bg-muted">
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
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent flex items-center p-8 md:p-12">
                      <div className="max-w-sm">
                        <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground mb-2">{collection.name}</h2>
                        <p className="text-primary-foreground/70 font-body text-sm leading-relaxed">{collection.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;
