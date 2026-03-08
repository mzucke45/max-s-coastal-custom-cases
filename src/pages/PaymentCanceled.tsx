import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const PaymentCanceled = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md space-y-6">
          <XCircle className="h-16 w-16 text-coral mx-auto" />
          <h1 className="font-display text-2xl font-bold">Payment Canceled</h1>
          <p className="text-muted-foreground font-body">
            Your payment was not completed. No charges were made. Your cart items are still saved.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button asChild variant="outline" className="rounded-full btn-squish">
              <Link to="/shop">Back to Shop</Link>
            </Button>
            <Button asChild className="rounded-full btn-squish">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default PaymentCanceled;
