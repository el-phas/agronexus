import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Leaf, 
  Globe, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Farmer First",
    description: "Every decision we make puts farmers' interests at the center. Their success is our success.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "We build trust through verified users, secure transactions, and transparent pricing.",
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "We promote sustainable farming practices that benefit both farmers and the environment.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description: "We leverage cutting-edge technology to solve real problems in agriculture.",
  },
];

const team = [
  {
    name: "Dr. James Kariuki",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Agricultural economist with 15+ years experience in East African markets.",
  },
  {
    name: "Sarah Mwende",
    role: "Chief Technology Officer",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=face",
    bio: "Former Google engineer, passionate about agritech innovation.",
  },
  {
    name: "Peter Omondi",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Supply chain expert with deep knowledge of agricultural logistics.",
  },
  {
    name: "Grace Achieng",
    role: "Head of Farmer Relations",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    bio: "Former farmer turned advocate for agricultural empowerment.",
  },
];

const stats = [
  { value: "10,000+", label: "Active Farmers" },
  { value: "5,000+", label: "Verified Buyers" },
  { value: "KES 500M+", label: "Total Transactions" },
  { value: "47", label: "Counties Covered" },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-hero py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 border-2 border-primary-foreground rounded-full" />
            <div className="absolute bottom-20 right-20 w-96 h-96 border border-primary-foreground rounded-full" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-primary-foreground mb-6">
                Transforming Agriculture Through Technology
              </h1>
              <p className="text-primary-foreground/80 text-lg sm:text-xl mb-8">
                We're on a mission to empower farmers and revolutionize how agricultural products reach markets across Africa.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 -mt-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-3xl shadow-lg p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="font-display font-bold text-4xl text-primary mb-2">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              <Card variant="gradient" className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                    <Target className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="font-display font-bold text-2xl">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To create a direct, transparent, and efficient marketplace that connects farmers with buyers, eliminating middlemen and ensuring fair prices for all stakeholders in the agricultural value chain.
                </p>
              </Card>

              <Card variant="gradient" className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-leaf flex items-center justify-center">
                    <Eye className="w-7 h-7 text-leaf-foreground" />
                  </div>
                  <h2 className="font-display font-bold text-2xl">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To become Africa's leading agricultural technology platform, transforming how food is grown, sold, and distributed while promoting sustainable farming practices and food security.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-primary font-semibold mb-3 font-display">Our Values</p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-6">
                What Drives Us Every Day
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <Card key={i} variant="elevated" className="text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-primary font-semibold mb-3 font-display">Our Team</p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-6">
                Meet the People Behind AgroNexus
              </h2>
              <p className="text-muted-foreground text-lg">
                A diverse team of experts passionate about agriculture and technology.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, i) => (
                <Card key={i} variant="elevated" className="overflow-hidden group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-lg mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-primary font-semibold mb-3 font-display">Why AgroNexus?</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl mb-6">
                  Built by Farmers, For Farmers
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  We understand the challenges farmers face because we've lived them. Our platform is designed to solve real problems with practical solutions.
                </p>

                <div className="space-y-4">
                  {[
                    "Direct connection to verified buyers - no middlemen",
                    "AI-powered insights for better decision making",
                    "Secure M-Pesa and mobile money payments",
                    "Real-time market prices and demand data",
                    "24/7 customer support in local languages",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-leaf shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <Button variant="hero" size="lg" className="mt-8">
                  Join Our Community
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=600&fit=crop"
                    alt="Farmer in field"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-leaf flex items-center justify-center">
                      <Users className="w-6 h-6 text-leaf-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-2xl">10,000+</p>
                      <p className="text-muted-foreground text-sm">Happy Farmers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
