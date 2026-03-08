import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentCanceled = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="font-display text-2xl font-bold">Payment Canceled</h1>
        <p className="text-muted-foreground font-body">
          Your payment was not completed. No charges were made. Your cart items are still saved.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/shop">Back to Shop</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled;
