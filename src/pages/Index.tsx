import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Paintbrush, Truck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-light/30 via-background to-seafoam/20 py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 -left-10 w-56 h-56 bg-seafoam/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block text-5xl mb-4"
            >
              🌊
            </motion.span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              Cases as unique as{" "}
              <span className="text-primary">your vibe</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Coastal-inspired phone cases designed with love. Browse our collection or create something totally you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop">
                <Button className="rounded-full px-8 h-12 text-base font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/25">
                  Shop Designs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/designer">
                <Button variant="outline" className="rounded-full px-8 h-12 text-base font-semibold hover:scale-105 active:scale-95 transition-transform border-2">
                  Design Your Own ✨
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Featured Designs 🐚</h2>
          <p className="text-muted-foreground font-body">Our most-loved coastal cases</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {products.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/shop/${product.id}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <h3 className="font-display font-bold text-primary-foreground text-lg">{product.name}</h3>
                      <p className="text-primary-foreground/80 text-sm">${product.price}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/shop">
            <Button variant="outline" className="rounded-full px-8 h-11 font-semibold hover:scale-105 active:scale-95 transition-transform border-2">
              View All Designs <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-sand/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How It Works 🏄</h2>
            <p className="text-muted-foreground font-body">Three simple steps to your dream case</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: ShoppingBag, title: "Browse", desc: "Explore our curated coastal designs or start from scratch.", emoji: "🔍" },
              { icon: Paintbrush, title: "Customize", desc: "Pick your phone model and make it yours.", emoji: "🎨" },
              { icon: Truck, title: "We Ship!", desc: "We print & ship your case straight to your door.", emoji: "📦" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{step.emoji}</div>
                <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground font-body text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">About Max's Customs 🌴</h2>
          <p className="text-muted-foreground font-body leading-relaxed mb-4">
            Hey! I'm Max, and I started this brand out of my love for the ocean and good design. 
            Every case is inspired by the California coast — the waves, the sunsets, the laid-back energy. 
            I believe your phone case should be as unique as you are.
          </p>
          <p className="text-muted-foreground font-body leading-relaxed">
            Whether you grab one of our pre-made designs or build something custom, 
            every order is printed with care and shipped with good vibes. 🤙
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
