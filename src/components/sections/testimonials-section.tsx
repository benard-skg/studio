import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    quote: "kgchess transformed my understanding of the game. My rating jumped 200 points in just three months!",
    name: "Alex P.",
    avatar: "https://placehold.co/100x100.png",
    aiHint: "happy student",
    rating: 5,
  },
  {
    quote: "The personalized approach and detailed game analysis were invaluable. Highly recommend for any aspiring player.",
    name: "Sarah K.",
    avatar: "https://placehold.co/100x100.png",
    aiHint: "focused chess player",
    rating: 5,
  },
  {
    quote: "I finally broke through my plateau thanks to kgchess. The strategic insights are top-notch.",
    name: "Mike L.",
    avatar: "https://placehold.co/100x100.png",
    aiHint: "thinking person",
    rating: 4,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Quote className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-bold">
            What Students Say
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Real stories from players who've leveled up their game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <Image 
                  src={testimonial.avatar} 
                  alt={`Avatar of ${testimonial.name}`} 
                  width={80} 
                  height={80} 
                  className="rounded-full mx-auto mb-4 border-2 border-accent"
                  data-ai-hint={testimonial.aiHint}
                />
                <Quote className="h-8 w-8 text-accent/50 mx-auto mb-4" />
                <p className="font-body text-base italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex justify-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <p className="font-headline text-lg font-semibold">{testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
