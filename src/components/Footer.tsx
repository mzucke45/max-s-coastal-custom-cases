import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ocean-deep text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-3">Max's Customs 🌊</h3>
            <p className="text-primary-foreground/70 font-body text-sm leading-relaxed">
              Handpicked designs & custom phone cases inspired by the coast. Small batch, big vibes.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Shop Designs</Link>
              <Link to="/designer" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Custom Designer</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-3">Connect</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <a href="#" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" /> @maxscustoms
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" /> hello@maxscustoms.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> California Coast ☀️
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Max's Customs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
