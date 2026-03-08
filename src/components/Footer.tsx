import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import { WaveDivider, WaveIcon, ShellIcon } from "./CoastalDecorations";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="relative">
      <WaveDivider className="-mb-1" />
      <div className="bg-ocean-deep wave-pattern">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-foreground/30">
                  <img src={logo} alt="Max's Customs" className="w-full h-full object-cover" />
                </div>
                <span className="font-display text-lg font-semibold text-primary-foreground">Max's Customs</span>
              </div>
              <p className="text-primary-foreground/70 font-body text-sm leading-relaxed max-w-xs">
                Curated and custom phone cases designed with intention. Small batch, crafted with care on the California coast.
              </p>
              <div className="flex items-center gap-2 mt-4 text-primary-foreground/40">
                <WaveIcon />
                <ShellIcon />
                <WaveIcon />
              </div>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-primary-foreground">Navigate</h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors font-body">Shop All</Link>
                <Link to="/collections" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors font-body">Collections</Link>
                <Link to="/designer" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors font-body">Customize</Link>
              </div>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-primary-foreground">Contact</h4>
              <div className="flex flex-col gap-2.5 text-sm text-primary-foreground/70 font-body">
                <a href="#" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                  <Instagram className="h-4 w-4" /> @maxscustoms
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                  <Mail className="h-4 w-4" /> hello@maxscustoms.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-primary-foreground/15 text-center text-xs text-primary-foreground/50 font-body">
            &copy; {new Date().getFullYear()} Max's Customs. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
