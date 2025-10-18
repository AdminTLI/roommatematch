import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/primitives/container'
import { Eyebrow } from '@/components/ui/primitives/eyebrow'
import { Avatar } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: "Emma van der Berg",
    university: "TU Delft",
    program: "Computer Science",
    avatar: "E",
    rating: 5,
    text: "I was skeptical at first, but the AI matching really works. My roommate and I have complementary personalities and study habits. Couldn't be happier!",
    highlight: "Perfect match!"
  },
  {
    name: "Lucas Janssen",
    university: "University of Amsterdam",
    program: "Economics",
    avatar: "L",
    rating: 5,
    text: "The compatibility scoring is spot on. We clicked immediately and now we're best friends. The platform made the whole process so much easier.",
    highlight: "Highly recommend!"
  },
  {
    name: "Sofia Rodriguez",
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
    <section className="py-14 md:py-20 lg:py-28 bg-white">
      <Container>
        <div className="text-center mb-12">
          <Eyebrow>What students are saying</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 md:mt-4">
            Real stories from successful matches
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-slate-600 mt-4">
            Join thousands of students who found their perfect roommate match
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="group rounded-2xl border shadow-sm p-6 md:p-8 h-full flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
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
                  <p className="text-slate-700 leading-relaxed mb-4 line-clamp-3">
                    "{testimonial.text}"
                  </p>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Avatar className="h-12 w-12">
                    <span className="text-lg font-semibold text-slate-700">
                      {testimonial.avatar}
                    </span>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {testimonial.program} • {testimonial.university}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary-600">
                    {testimonial.highlight}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
