import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutDialog from "@/components/CheckoutDialog";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col glass-strong">
          <SheetHeader>
            <SheetTitle className="font-display text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Your Cart
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </motion.div>
              <p className="text-muted-foreground font-body font-medium">Your cart is empty</p>
              <p className="text-muted-foreground/60 font-body text-sm">Browse our collection to get started</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.phoneModel}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm truncate">{item.productName}</h4>
                        <p className="text-xs text-muted-foreground font-body">{item.phoneModel}</p>
                        <p className="text-sm font-semibold text-foreground mt-1 font-body">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.productId, item.phoneModel, item.quantity - 1)}
                            className="rounded-full p-1 bg-background hover:bg-accent transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </motion.button>
                          <span className="text-sm font-bold w-5 text-center font-body">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.productId, item.phoneModel, item.quantity + 1)}
                            className="rounded-full p-1 bg-background hover:bg-accent transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => removeItem(item.productId, item.phoneModel)}
                            className="ml-auto rounded-full p-1 hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between font-display text-lg font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full rounded-full h-12 text-sm font-semibold tracking-wide btn-squish shadow-lg shadow-primary/20"
                  onClick={() => {
                    setIsOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  Checkout
                </Button>
                <Button
                  variant="ghost"
                  className="w-full rounded-full text-sm text-muted-foreground font-medium"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
};

export default CartDrawer;
