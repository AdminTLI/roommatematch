import { Card, CardContent } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: "Emma",
    university: "TU Delft",
    program: "Computer Science",
    avatar: "E",
    rating: 5,
    text: "I was skeptical at first, but the AI matching really works. My roommate and I have complementary personalities and study habits. Couldn't be happier!",
    highlight: "Perfect match!"
  },
  {
    name: "Lucas",
    university: "University of Amsterdam",
    program: "Economics",
    avatar: "L",
    rating: 5,
    text: "The compatibility scoring is spot on. We clicked immediately and now we're best friends. The platform made the whole process so much easier.",
    highlight: "Highly recommend!"
  },
  {
    name: "Sofia",
    university: "Rotterdam School of Management", 
    program: "Business Administration",
    avatar: "S",
    rating: 5,
    text: "I was skeptical at first, but the AI matching really works. My roommate and I have complementary personalities and study habits. Couldn't be happier!",
    highlight: "Highly recommend!"
  }
]

export function Testimonials() {
  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            What students are saying
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            Join thousands of students who found their perfect roommate match
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="rounded-2xl border border-brand-border/50 shadow-elev-1 p-6 md:p-8 bg-white/80 backdrop-blur-sm h-full flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="flex-1">
                  <p className="text-brand-text leading-relaxed mb-4 line-clamp-3">
                    "{testimonial.text}"
                  </p>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                  <div className="h-12 w-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-brand-primary">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-text">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-brand-muted">
                      <span>{testimonial.program}</span>
                      <span className="mx-2">•</span>
                      <span>{testimonial.university}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-brand-accent">
                    {testimonial.highlight}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}