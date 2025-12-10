import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "John Mwangi",
    role: "Maize Farmer",
    location: "Nakuru",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "AgroNexus changed my life. I now sell directly to buyers and earn 40% more than before. The AI recommendations helped me optimize my planting schedule.",
  },
  {
    name: "Grace Akinyi",
    role: "Vegetable Farmer",
    location: "Kiambu",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "The marketplace is so easy to use. I listed my tomatoes and got my first order within 2 hours! Payment came through instantly via M-Pesa.",
  },
  {
    name: "Peter Ochieng",
    role: "Produce Buyer",
    location: "Nairobi",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "As a restaurant owner, sourcing fresh produce used to be a headache. Now I browse, order, and track deliveries all in one app. Quality is always excellent.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3 font-display">Testimonials</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
            Loved by <span className="text-gradient-hero">Farmers & Buyers</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied users who have transformed their agricultural business.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} variant="gradient" className="relative">
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="w-10 h-10 text-primary/10" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-harvest text-harvest" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h4 className="font-display font-bold">{testimonial.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
