import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products } from "@/data/products";

const Shop = () => {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Shop Designs 🐚</h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Our curated collection of coastal-inspired phone cases. Pick a vibe!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/shop/${product.id}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="mt-3 px-1">
                  <h3 className="font-display font-bold text-base">{product.name}</h3>
                  <p className="text-primary font-semibold text-sm">${product.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
