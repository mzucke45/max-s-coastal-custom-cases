import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MockupPreviewModalProps {
  open: boolean;
  onClose: () => void;
  mockupUrl: string;
  modelName: string;
  onPlaceOrder: () => void;
}

export default function MockupPreviewModal({
  open,
  onClose,
  mockupUrl,
  modelName,
  onPlaceOrder,
}: MockupPreviewModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Blurred dark overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-20 bg-card border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Model name */}
            <p className="text-center text-white/80 font-body text-sm font-semibold tracking-wide uppercase mb-4">
              {modelName} Preview
            </p>

            {/* Mockup image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 bg-card">
              <img
                src={mockupUrl}
                alt={`${modelName} case mockup`}
                className="w-full h-auto"
                draggable={false}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 gap-2 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                onClick={onClose}
              >
                <Pencil className="h-4 w-4" /> Keep Editing
              </Button>
              <Button
                className="flex-1 gap-2 rounded-full shadow-lg"
                onClick={onPlaceOrder}
              >
                <ShoppingCart className="h-4 w-4" /> Place Order
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
