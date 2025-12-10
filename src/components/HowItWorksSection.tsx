import { ArrowRight, UserCheck, Package, Truck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "Sign Up & Verify",
    description: "Create your account and complete verification. It takes less than 5 minutes.",
    color: "bg-primary",
  },
  {
    icon: Package,
    title: "List Your Products",
    description: "Upload photos, set prices, and add product details. Reach thousands of buyers.",
    color: "bg-leaf",
  },
  {
    icon: Truck,
    title: "Receive Orders",
    description: "Get notified instantly when buyers place orders. Manage everything from one dashboard.",
    color: "bg-secondary",
  },
  {
    icon: CreditCard,
    title: "Get Paid Securely",
    description: "Receive payments directly via M-Pesa or bank transfer. Fast and secure.",
    color: "bg-harvest",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3 font-display">How It Works</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
            Start Selling in{" "}
            <span className="text-gradient-golden">4 Easy Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're a small-scale farmer or managing large operations, getting started is simple.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-leaf to-harvest -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-display font-bold text-primary z-10">
                  {i + 1}
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl p-6 pt-10 text-center shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (except last) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                    <ArrowRight className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
