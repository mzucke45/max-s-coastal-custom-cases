import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { WaveLoader, ConfettiBurst } from "@/components/CoastalDecorations";
import PageTransition from "@/components/PageTransition";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ sessionId }),
          }
        );
        const result = await res.json();
        if (result.success) {
          setVerified(true);
          clearCart();
        }
      } catch {
        setVerified(true);
        clearCart();
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams, clearCart]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4">
        <ConfettiBurst active={verified && !verifying} />
        <div className="text-center max-w-md space-y-6">
          {verifying ? (
            <>
              <WaveLoader />
              <h1 className="font-display text-2xl font-bold">Verifying Payment...</h1>
              <p className="text-muted-foreground font-body">Please wait while we confirm your order.</p>
            </>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <CheckCircle className="h-16 w-16 text-seafoam mx-auto" />
              </motion.div>
              <h1 className="font-display text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground font-body">
                Thank you for your order. You'll receive a confirmation email shortly.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button asChild variant="outline" className="rounded-full btn-squish">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
                <Button asChild className="rounded-full btn-squish">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PaymentSuccess;
