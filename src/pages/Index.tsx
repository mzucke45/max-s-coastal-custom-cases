import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, collections } from "@/data/products";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Custom Phone Cases &mdash; Crafted with Care
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground mb-6 leading-[1.1]">
              Cases as unique as you
            </h1>
            <p className="font-body text-base text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Coastal-inspired designs, handpicked and made to order. Browse our collection or create something entirely your own.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop">
                <Button className="rounded-full px-8 h-12 text-sm font-medium tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/designer">
                <Button variant="outline" className="rounded-full px-8 h-12 text-sm font-medium tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  Create Your Own
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20 md:py-28 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Curated Selection</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Featured Designs</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {products.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/shop/${product.id}`} className="group block">
                <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                    <div>
                      <h3 className="font-display font-semibold text-primary-foreground text-lg">{product.name}</h3>
                      <p className="text-primary-foreground/80 text-sm font-body">${product.price}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/shop">
            <Button variant="outline" className="rounded-full px-8 h-11 text-sm font-medium tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-transform">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Collections Preview */}
      <section className="py-20 md:py-28 bg-accent/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Explore</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Our Collections</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/collections/${collection.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-muted">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent flex items-end p-6">
                      <div>
                        <h3 className="font-display font-semibold text-primary-foreground text-xl mb-1">{collection.name}</h3>
                        <p className="text-primary-foreground/70 text-sm font-body line-clamp-2">{collection.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Simple Process</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">How It Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {[
              { step: "01", title: "Browse", desc: "Explore our curated collections or start with a blank canvas." },
              { step: "02", title: "Customize", desc: "Select your phone model and personalize your design." },
              { step: "03", title: "We Ship", desc: "Printed with precision and delivered straight to your door." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <span className="font-display text-4xl font-light text-muted-foreground/40">{item.step}</span>
                <h3 className="font-display text-xl font-semibold mt-2 mb-2">{item.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Our Story</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6">About Max's Customs</h2>
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
  );
};

export default Index;
