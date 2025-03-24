
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "RuraLearn has transformed how I think about my farming business. The courses are practical and directly applicable to my daily work.",
    author: "Maria Rodriguez",
    role: "Small Farm Owner",
    location: "Rural Mexico",
  },
  {
    quote: "As a teacher in a small village, I've been able to bring new teaching methods to my students thanks to RuraLearn. The offline access feature is a game-changer for us.",
    author: "Rajiv Patel",
    role: "Primary School Teacher",
    location: "Rural India",
  },
  {
    quote: "The community support on RuraLearn helped me connect with other entrepreneurs facing similar challenges in rural areas. We now share ideas and resources regularly.",
    author: "Grace Mwangi",
    role: "Entrepreneur",
    location: "Rural Kenya",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">What Our Community Says</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real stories from real people who have transformed their lives through education.
            </p>
          </div>
          
          <div className="relative glass-panel rounded-2xl p-8 md:p-12">
            <Quote className="absolute top-8 left-8 text-primary/10 h-24 w-24" />
            
            <div className="relative z-10">
              <div className="flex flex-col items-center text-center">
                <p className="text-xl md:text-2xl mb-8 relative z-10 max-w-3xl mx-auto">
                  "{testimonials[activeIndex].quote}"
                </p>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto"></div>
                  <div className="font-medium text-lg">{testimonials[activeIndex].author}</div>
                  <div className="text-muted-foreground">{testimonials[activeIndex].role}</div>
                  <div className="text-sm text-muted-foreground">{testimonials[activeIndex].location}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeIndex ? 'bg-primary scale-125' : 'bg-primary/30'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                ></button>
              ))}
            </div>
            
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <button 
                onClick={prevTestimonial}
                className="bg-background/80 hover:bg-background text-foreground p-2 rounded-full shadow-subtle transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <button 
                onClick={nextTestimonial}
                className="bg-background/80 hover:bg-background text-foreground p-2 rounded-full shadow-subtle transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
