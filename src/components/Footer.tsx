import { Link, useLocation } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import { WaveDivider, WaveIcon, ShellIcon } from "./CoastalDecorations";
import logo from "@/assets/logo.png";

const Footer = () => {
  const location = useLocation();
  const isDesignerPage = location.pathname === "/designer";

  return (
    <footer className="relative">
      <WaveDivider className="-mb-1" />
      <div className="bg-sky-deep wave-pattern">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30">
                  <img src={logo} alt="Max's Customs" className="w-full h-full object-cover" />
                </div>
                <span className="font-display text-lg font-semibold text-white italic">Max's Customs</span>
              </div>
              <p className="text-white/70 font-body text-sm leading-relaxed max-w-xs">
                Curated and custom phone cases designed with intention. Small batch, crafted with care on the California coast.
              </p>
              <div className="flex items-center gap-2 mt-4 text-white/40">
                <WaveIcon />
                <ShellIcon />
                <WaveIcon />
              </div>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-white">Navigate</h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/shop" className="text-white/70 hover:text-white text-sm transition-colors font-body">Shop All</Link>
                <Link to="/collections" className="text-white/70 hover:text-white text-sm transition-colors font-body">Collections</Link>
                <Link to="/designer" className="text-white/70 hover:text-white text-sm transition-colors font-body">Customize</Link>
              </div>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-white">Contact</h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/70 font-body">
                <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" /> @maxscustoms
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" /> hello@maxscustoms.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/15 text-center text-xs text-white/50 font-body">
            &copy; {new Date().getFullYear()} Max's Customs. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
