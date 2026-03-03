import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-border">
                <img src={logo} alt="Max's Customs" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-lg font-semibold text-foreground">Max's Customs</span>
            </div>
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs">
              Curated and custom phone cases designed with intention. Small batch, crafted with care on the California coast.
            </p>
          </div>

          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-foreground">Navigate</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/shop" className="text-muted-foreground hover:text-foreground text-sm transition-colors font-body">Shop All</Link>
              <Link to="/collections" className="text-muted-foreground hover:text-foreground text-sm transition-colors font-body">Collections</Link>
              <Link to="/designer" className="text-muted-foreground hover:text-foreground text-sm transition-colors font-body">Customize</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-foreground">Contact</h4>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground font-body">
              <a href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Instagram className="h-4 w-4" /> @maxscustoms
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> hello@maxscustoms.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} Max's Customs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
