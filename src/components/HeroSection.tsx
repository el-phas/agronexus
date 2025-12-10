import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, TrendingUp, Users, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Beautiful farmland at sunrise with drone technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="max-w-2xl animate-slide-up">
            <Badge variant="success" className="mb-6">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trusted by 10,000+ farmers
            </Badge>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-6">
              Grow Smarter,{" "}
              <span className="text-gradient-hero">Sell Better</span>,{" "}
              <span className="text-secondary">Thrive Together</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg">
              Connect directly with buyers, access real-time market data, and harness AI-powered insights to maximize your farm's potential.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="hero" size="lg" asChild>
                <Link to="/marketplace">
                  Start Selling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { icon: Users, value: "10K+", label: "Active Farmers" },
                { icon: ShieldCheck, value: "100%", label: "Secure Payments" },
                { icon: TrendingUp, value: "40%", label: "Higher Revenue" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl">{stat.value}</p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Cards */}
          <div className="hidden lg:block relative">
            <div className="absolute top-10 right-10 bg-card/90 backdrop-blur-md rounded-2xl p-4 shadow-lg animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-leaf flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-leaf-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Maize Price</p>
                  <p className="text-leaf font-bold">+12% this week</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 right-0 bg-card/90 backdrop-blur-md rounded-2xl p-4 shadow-lg animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">New Order</p>
                  <p className="text-muted-foreground text-sm">500kg Tomatoes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
