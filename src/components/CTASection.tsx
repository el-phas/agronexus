import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-hero rounded-3xl p-12 lg:p-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-foreground rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-primary-foreground rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary-foreground rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-primary-foreground mb-6">
              Ready to Transform Your Agricultural Business?
            </h2>

            <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of farmers and buyers who are already benefiting from direct connections, smart analytics, and secure transactions.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="golden"
                size="xl"
                asChild
              >
                <Link to="/marketplace">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
