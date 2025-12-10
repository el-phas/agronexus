import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  farmer: string;
  unit: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Fresh Organic Tomatoes",
      price: 120,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      farmer: "John Mwangi",
      unit: "kg",
    },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = 500;
  const tax = subtotal * 0.16;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display font-bold text-3xl mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {cartItems.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h2 className="font-display font-bold text-xl mb-2">
                      Your cart is empty
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Start shopping to add items to your cart
                    </p>
                    <Button variant="hero" asChild>
                      <a href="/marketplace">Continue Shopping</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.id} variant="elevated">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-lg">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              by {item.farmer}
                            </p>
                            <p className="text-primary font-bold mt-2">
                              KES {item.price}/{item.unit}
                            </p>
                          </div>

                          {/* Quantity & Actions */}
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-semibold w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="font-display font-bold text-lg">
                              KES {item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <div>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary Details */}
                    <div className="space-y-3 pb-4 border-b border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">KES {subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-semibold">KES {shippingCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (16%)</span>
                        <span className="font-semibold">KES {tax.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-display font-bold text-lg">
                        Total
                      </span>
                      <span className="font-display font-bold text-2xl text-primary">
                        KES {total.toFixed(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="bg-sky/10 border border-sky/20 rounded-lg p-3 flex gap-3 mb-6">
                      <AlertCircle className="w-5 h-5 text-sky flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Secure checkout. Your payment information is encrypted.
                      </p>
                    </div>

                    {/* CTA */}
                    <Button variant="hero" size="lg" className="w-full">
                      Proceed to Checkout
                    </Button>
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <a href="/marketplace">Continue Shopping</a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <div className="mt-6 space-y-3">
                  <div className="text-center text-sm text-muted-foreground">
                    ✓ 100% Secure Payment
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    ✓ Direct from Farmers
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    ✓ Quality Guaranteed
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
