import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import cartService from '@/services/cart';
import authService from "@/services/auth";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { data: cartItems = [] } = useQuery({ queryKey: ['cart'], queryFn: cartService.getCart });
  const [loading, setLoading] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);

  const [formData, setFormData] = useState({ delivery_address: "", delivery_notes: "", phone_number: "" });

  const subtotal = cartItems.reduce((sum: any, item: any) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.16;
  const shipping = 500;
  const total = subtotal + tax + shipping;

  const handleCheckout = async (e: any) => {
    e.preventDefault();
    if (!formData.delivery_address || !formData.phone_number) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const orderResponse = await api.post('/orders', {
        items: (cartItems || []).map((item: any) => ({ product_id: item.product_id?._id || item.product_id || item.id, quantity: item.quantity, unit_price: item.product_id?.price || item.unit_price || item.price, seller_id: item.product_id?.farmer_id || item.seller_id })),
        delivery_address: formData.delivery_address,
        delivery_notes: formData.delivery_notes,
      });

      const orderId = orderResponse.data.id;
      const paymentResponse = await api.post('/payments/initiate', { orderId, phoneNumber: formData.phone_number });
      setPaymentStarted(true);
      toast({ title: 'Success', description: 'Check your phone for M-Pesa prompt' });

      const paymentId = paymentResponse.data.payment_id;

      const poll = setInterval(async () => {
        try {
          const statusRes = await api.get(`/payments/${paymentId}/status`);
          if (statusRes.data.status === 'completed') {
            clearInterval(poll);
            toast({ title: 'Payment Successful', description: 'Order confirmed' });
            navigate(`/orders/${orderId}`, { state: { orderId } });
          } else if (statusRes.data.status === 'failed') {
            clearInterval(poll);
            toast({ title: 'Payment Failed', description: statusRes.data.reason || 'Payment failed', variant: 'destructive' });
          }
        } catch (err) {
          console.error('poll error', err);
        }
      }, 3000);

      setTimeout(() => clearInterval(poll), 5 * 60 * 1000);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Checkout failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!authService.isAuthenticated()) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                      <textarea value={formData.delivery_address} onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number (M-Pesa) *</label>
                      <Input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="254712345678" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Notes</label>
                      <textarea value={formData.delivery_notes} onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading || paymentStarted}>{loading ? 'Processing...' : paymentStarted ? 'Processing Payment...' : 'Proceed to Payment'}</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 pb-4 border-b">
                    {(cartItems || []).map((item: any) => (
                      <div key={item._id || item.id} className="flex justify-between text-sm">
                        <span>{item.product_id?.name || item.name} x{item.quantity}</span>
                        <span>KES {(item.product_id?.price || item.unit_price || item.price) * (item.quantity || 0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>KES {subtotal}</span></div>
                    <div className="flex justify-between"><span>Tax (16%)</span><span>KES {tax.toFixed(0)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>KES {shipping}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>KES {total.toFixed(0)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
