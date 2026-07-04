import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoAsset from "@/assets/maximal-logo.png.asset.json";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/collections", label: "Collections" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between h-18 px-4 py-3.5">
        <Link to="/" className="flex items-center gap-3 group" aria-label="MAXIMAL home">
          <motion.img
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            src={logoAsset.url}
            alt="MAXIMAL"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                location.pathname === link.to
                  ? "bg-sky/15 text-sky-deep font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-full hover:bg-muted/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border/50 bg-card/95 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`font-body text-sm font-medium py-3 px-4 rounded-xl block transition-all ${
                      location.pathname === link.to
                        ? "bg-sky/15 text-sky-deep"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
