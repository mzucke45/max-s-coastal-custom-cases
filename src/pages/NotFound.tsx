import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sky/15 text-sky-deep mb-6"
          >
            <Waves className="h-10 w-10" />
          </motion.div>
          <h1 className="font-display text-6xl font-bold mb-4">404</h1>
          <p className="mb-6 text-muted-foreground font-body">Lost at sea? This page doesn't exist.</p>
          <Link to="/" className="text-sky-deep font-body text-sm font-semibold hover:underline transition-colors">
            Sail back home
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
