interface Testimonial {
  id: string;
  text: string;
  author: {
    name: string;
    title: string;
    initials: string;
    avatarColor: string;
  };
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      text: "I've been collecting antiques for over 20 years, and Heritage Treasures has the most authentic and well-curated collection I've encountered. Their raffle system is innovative and allowed me to acquire pieces I'd otherwise never afford.",
      author: {
        name: "Eleanor Blackwood",
        title: "Art Historian",
        initials: "EB",
        avatarColor: "bg-accent"
      },
      rating: 5
    },
    {
      id: "2",
      text: "The Victorian writing desk I purchased arrived beautifully packaged with detailed provenance documentation. Their attention to detail is unmatched. The customer service was exceptional throughout the entire process.",
      author: {
        name: "James Thompson",
        title: "Interior Designer",
        initials: "JT",
        avatarColor: "bg-primary"
      },
      rating: 5
    },
    {
      id: "3",
      text: "I won an Art Deco jewelry set through their raffle system for just $60 in tickets! The transparency of their raffles is commendable - they show exact odds and ticket sales. I'll definitely be entering more raffles in the future.",
      author: {
        name: "Sophia Martinez",
        title: "Jewelry Collector",
        initials: "SM",
        avatarColor: "bg-secondary"
      },
      rating: 4.5
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="ri-star-fill"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="ri-star-half-fill"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line"></i>);
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-white border-t border-neutral-paper">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl mb-3">What Our Collectors Say</h2>
          <p className="text-neutral-wood opacity-70 max-w-2xl mx-auto">
            Hear from our community of passionate antique enthusiasts and collectors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-neutral-ivory p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-secondary">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="italic mb-6">{testimonial.text}</p>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${testimonial.author.avatarColor} flex items-center justify-center text-white`}>
                  <span className="font-medium">{testimonial.author.initials}</span>
                </div>
                <div className="ml-3">
                  <div className="font-medium">{testimonial.author.name}</div>
                  <div className="text-sm text-neutral-wood opacity-70">{testimonial.author.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
