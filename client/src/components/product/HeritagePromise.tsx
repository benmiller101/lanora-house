interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export default function HeritagePromise() {
  const features: Feature[] = [
    {
      id: "1",
      icon: "ri-verify-line",
      title: "Authenticity Guaranteed",
      description: "Every item is thoroughly authenticated by our team of experts."
    },
    {
      id: "2",
      icon: "ri-history-line",
      title: "Documented Provenance",
      description: "We provide detailed history and documentation for each piece."
    },
    {
      id: "3",
      icon: "ri-secure-payment-line",
      title: "Secure Transactions",
      description: "Your purchases and raffle entries are protected by bank-level security."
    },
    {
      id: "4",
      icon: "ri-truck-line",
      title: "White Glove Delivery",
      description: "Specialized packaging and handling for safe arrival of your treasures."
    }
  ];

  return (
    <section className="py-16 bg-neutral-ivory border-t border-neutral-paper">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl mb-3">The Heritage Promise</h2>
          <p className="text-neutral-wood opacity-70 max-w-2xl mx-auto">
            We ensure every piece in our collection meets our rigorous standards.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <i className={`${feature.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="font-display text-xl mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-wood opacity-70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}