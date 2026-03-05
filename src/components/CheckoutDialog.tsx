import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postCode: "",
    country: "US",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.addressLine1 || !form.city || !form.postCode || !form.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          phoneModel: item.phoneModel,
        })),
        shippingAddress: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postCode: form.postCode.trim(),
          country: form.country.trim(),
        },
      };

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gelato-api?action=create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Order submission failed");
      }

      toast.success("Order placed successfully! You'll receive a confirmation email.");
      clearCart();
      onOpenChange(false);
      setForm({
        firstName: "", lastName: "", email: "", phone: "",
        addressLine1: "", addressLine2: "", city: "", state: "", postCode: "", country: "US",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Checkout</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2 mb-2">
          {items.map((item) => (
            <div key={`${item.productId}-${item.phoneModel}`} className="flex justify-between text-sm font-body">
              <span className="truncate mr-2">{item.productName} × {item.quantity}</span>
              <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-display font-semibold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">First Name *</label>
              <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Last Name *</label>
              <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Phone</label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Address Line 1 *</label>
            <Input value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Address Line 2</label>
            <Input value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">City *</label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">State</label>
              <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Postal Code *</label>
              <Input value={form.postCode} onChange={(e) => update("postCode", e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Country Code *</label>
            <Input value={form.country} onChange={(e) => update("country", e.target.value)} maxLength={2} placeholder="US" required />
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-full h-12 text-sm font-medium tracking-wide">
            {submitting ? "Placing Order..." : `Place Order · $${totalPrice.toFixed(2)}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
