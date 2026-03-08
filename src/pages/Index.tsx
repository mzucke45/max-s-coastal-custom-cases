import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Waves, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, staggerItem, WaveDivider } from "@/components/CoastalDecorations";

const Index = () => {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: collections = [], isLoading: loadingCollections } = useCollections();

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden py-28 md:py-44">
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-light/50 via-seafoam-light/30 to-background" />
          <div className="absolute inset-0 wave-pattern" />
          {/* Floating decorative shapes */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[15%] w-16 h-16 rounded-full bg-coral/15 blur-sm"
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-md"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 left-[20%] w-10 h-10 rounded-full bg-sun/20 blur-sm"
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-body font-semibold mb-6"
              >
                <Waves className="h-4 w-4" /> Coastal-Inspired Cases
              </motion.div>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1]">
                Cases as unique as you
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                Coastal-inspired designs, handpicked and made to order. Browse our collection or create something entirely your own.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/shop">
                  <Button className="rounded-full px-8 h-12 text-sm font-semibold tracking-wide btn-squish shadow-lg shadow-primary/25">
                    Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/designer">
                  <Button variant="outline" className="rounded-full px-8 h-12 text-sm font-semibold tracking-wide btn-squish bg-card/50 backdrop-blur-sm">
                    Create Your Own
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Designs */}
        <section className="py-20 md:py-28 container mx-auto px-4 relative">
          <StaggerContainer className="text-center mb-14">
            <motion.div variants={staggerItem}>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-coral font-bold mb-3">Curated Selection</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Designs</h2>
            </motion.div>
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {loadingProducts
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-[3/4] rounded-2xl" />
                    <Skeleton className="h-4 w-3/4 mt-3 rounded-full" />
                  </div>
                ))
              : products.slice(0, 6).map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
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
                        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                          <div>
                            <h3 className="font-display font-bold text-primary-foreground text-lg">{product.name}</h3>
                            <p className="text-primary-foreground/80 text-sm font-body">${Number(product.price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </StaggerContainer>

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/shop">
                <Button variant="outline" className="rounded-full px-8 h-11 text-sm font-semibold tracking-wide btn-squish">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Collections Preview */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-seafoam-light/40 to-background">
          <div className="container mx-auto px-4">
            <StaggerContainer className="text-center mb-14">
              <motion.div variants={staggerItem}>
                <p className="font-body text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3">Explore</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold">Our Collections</h2>
              </motion.div>
            </StaggerContainer>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {loadingCollections
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
                  ))
                : collections.map((collection) => (
                    <motion.div key={collection.id} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                      <Link to={`/collections/${collection.id}`} className="group block">
                        <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted shadow-md hover:shadow-xl transition-shadow duration-500">
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
                          <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/70 via-ocean-deep/20 to-transparent flex items-end p-6">
                            <div>
                              <h3 className="font-display font-bold text-primary-foreground text-xl mb-1">{collection.name}</h3>
                              <p className="text-primary-foreground/70 text-sm font-body line-clamp-2">{collection.description}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <StaggerContainer className="text-center mb-14">
              <motion.div variants={staggerItem}>
                <p className="font-body text-xs uppercase tracking-[0.3em] text-coral font-bold mb-3">Simple Process</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold">How It Works</h2>
              </motion.div>
            </StaggerContainer>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-3xl mx-auto">
              {[
                { icon: Waves, step: "01", title: "Browse", desc: "Explore our curated collections or start with a blank canvas." },
                { icon: Palette, step: "02", title: "Customize", desc: "Select your phone model and personalize your design." },
                { icon: Sun, step: "03", title: "We Ship", desc: "Printed with precision and delivered straight to your door." },
              ].map((item) => (
                <motion.div key={item.title} variants={staggerItem} className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4"
                  >
                    <item.icon className="h-7 w-7" />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold mt-2 mb-2">{item.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* About */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sand/50 via-coral-light/30 to-seafoam-light/40" />
          <div className="absolute inset-0 sand-texture" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto text-center"
            >
              <p className="font-body text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3">Our Story</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">About Max's Customs</h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-4">
                Born from a love for the ocean and intentional design, Max's Customs creates phone cases
                that reflect who you are. Every piece is inspired by the California coast — the light,
                the textures, the effortless beauty of it all.
              </p>
              <p className="text-muted-foreground font-body leading-relaxed">
                Whether you choose from our curated collection or build something entirely custom,
                every order is printed with care and shipped with intention.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Index;
