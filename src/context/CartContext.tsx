import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  phoneModel: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, phoneModel: string) => void;
  updateQuantity: (productId: string, phoneModel: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.phoneModel === item.phoneModel
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.phoneModel === item.phoneModel
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, phoneModel: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.phoneModel === phoneModel)));
  }, []);

  const updateQuantity = useCallback((productId: string, phoneModel: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, phoneModel);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.phoneModel === phoneModel ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};
