import { Card, CardContent } from "@/components/ui/card";
import { 
  Leaf, 
  ShoppingCart, 
  BarChart3, 
  MessageCircle, 
  Wallet, 
  Truck, 
  Shield, 
  Brain 
} from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Farm Management",
    description: "Track crops, manage inventory, and monitor farm performance with intuitive dashboards.",
    color: "bg-leaf",
  },
  {
    icon: ShoppingCart,
    title: "Marketplace",
    description: "List your products and connect with verified buyers instantly. No middlemen.",
    color: "bg-secondary",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "AI-powered insights for pricing, demand forecasting, and market trends.",
    color: "bg-primary",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with buyers, negotiate prices, and close deals in real-time.",
    color: "bg-sky",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "M-Pesa and mobile money integration. Fast, secure, and reliable transactions.",
    color: "bg-harvest",
  },
  {
    icon: Truck,
    title: "Logistics Support",
    description: "Schedule deliveries, track shipments, and manage your supply chain effortlessly.",
    color: "bg-earth",
  },
  {
    icon: Shield,
    title: "Verified Users",
    description: "All farmers and buyers are verified for trust and security on every transaction.",
    color: "bg-primary",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Get personalized suggestions for planting, pricing, and pest management.",
    color: "bg-leaf",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3 font-display">Features</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-hero">Succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From farm management to market analytics, we provide all the tools you need to grow your agricultural business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card
              key={i}
              variant="elevated"
              className="group cursor-pointer hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
