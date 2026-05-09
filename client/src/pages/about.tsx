import SEOHead from "@/components/SEOHead";
import logomarkPath from "@assets/Lanora_house-Logomark-Colour@5x.png";
import verticalColorLogoPath from "@assets/Lanora_house-Vertical-Logo-Colour@5x.png";
import newVerticalColorLogoPath from "@assets/Lanora_house-Vertical-Logo-Colour-strippedHD_1774293317365.png";
import horizontalWhiteLogoPath from "@assets/Lanora_house_Horizontal_White_1771706622568.png";

export default function About() {
  return (
    <>
      <SEOHead
        title="About Lanora House | House Clearance & Auctions, Hayle Cornwall"
        description="Lanora House is a sustainable house clearance and auction company based in Hayle, Cornwall. We serve Cornwall, Devon, and the wider South West, combining clearances, monthly auctions, and eBay Live sales."
        path="/about"
      />

      {/* Hero Section */}
      <section className="relative bg-blue-50 py-24 overflow-hidden">
        <div className="absolute inset-0 "></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="mb-12">
            <img 
              src={newVerticalColorLogoPath} 
              alt="Lanora House logo" 
              className="h-48 w-auto mx-auto mb-8 drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-display text-neutral-800 mb-8">
            About Lanora House
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Professional clearance services and auctions serving Cornwall, Devon, and the wider South West from our historic venue in Hayle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/clearance"
              className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Our Services
            </a>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-0 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display text-neutral-800 mb-6">Our Story</h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                From university sellers to professional clearances and auctions - a journey built on passion for discovering value and giving items a second life
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-display text-neutral-800 mb-4">Built from recognising value where others see waste</h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    Lanora House started after we saw how much was being thrown away during house clearances and construction work. We saw huge amounts of usable furniture, tools, materials, and household items going straight to waste, often entire lifetimes of belongings treated as rubbish.
                  </p>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    We realised that clearances are full of stories and value, from antiques and collections to everyday items that still have a second life elsewhere. With a background in buying and selling antiques and household items, we learned how to recognise value where others might just see waste.
                  </p>
                  <p className="text-neutral-600 leading-relaxed">
                    Lanora House was built to do things differently, combining clearances, auctions, resale, recycling, and waste reduction to recover value, reduce landfill, and make clearances more affordable and responsible.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-display text-neutral-800 mb-4">Introducing Our New Auction House</h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    Our monthly auctions are held at <strong>The Old Foundry Chapel</strong>, a beautifully restored historic venue located at <strong>Unit 12b, Chapel Terrace, Hayle, Cornwall TR27 4AB</strong>.
                  </p>
                  <p className="text-neutral-600 leading-relaxed">
                    This auction service is the perfect complement to our clearance business, allowing us to sell valuable items recovered from clearances and help our customers offset their clearance costs. Our viewing room is open to the public, and we welcome both sellers and bidders to this exciting new chapter.
                  </p>
                </div>
                
                <div className="bg-green-50 p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-display text-neutral-800 mb-4">Making Space for What Matters</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    At Lanora House, clearance isn't just about removal — it's about restoring calm, order, and opportunity. Whether it's a home that needs compassion after a bereavement or a building site that needs to stay on schedule, your space is our priority.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-primary/10 p-12 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-center mb-6">
                      <img 
                        src={newVerticalColorLogoPath} 
                        alt="Lanora House logo" 
                        className="h-20 w-auto"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-3xl font-display text-primary mb-2">EST.</div>
                    <div className="text-6xl font-display text-neutral-800 mb-4">2025</div>
                    <div className="text-lg text-neutral-600 mb-2">Hayle, Cornwall</div>
                    <div className="text-sm text-neutral-500">Local, Responsible, Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 bg-neutral-50 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display text-neutral-800 mb-6">Our Values</h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                The principles that guide everything we do, from first contact to final sweep-up
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-neutral-800 mb-4">Sustainability</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We operate under a zero-to-landfill promise, aiming to recycle, reuse, or donate 100% of what we clear. Waste is a resource, not a problem — and we treat it that way.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-neutral-800 mb-4">People First</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    From your first contact to the final sweep-up, you'll deal with real people who care. We're known for being approachable, responsive, and professional in every situation.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-neutral-800 mb-4">Transparency</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We believe in transparency and accountability. Waste is tracked, documented, and accounted for. We're fully licensed and insured, meeting all industry standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Special */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96  rounded-full transform -translate-x-48 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-display text-neutral-800 mb-6">Why Our Customers Choose Us</h2>
                  <p className="text-xl text-neutral-600 leading-relaxed mb-8">
                    We bring simplicity to what can often be a stressful situation, with excellent customer service and environmental responsibility at our core.
                  </p>
                </div>
                
                <div className="grid gap-6">
                  <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">Fast & Flexible</h3>
                      <p className="text-neutral-600">We offer same-day or next-day services whenever possible. Our streamlined booking system means we're there when you need us most.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-6 bg-amber-50 rounded-xl">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">Fully Licensed & Insured</h3>
                      <p className="text-neutral-600">We meet all industry standards and environmental regulations. That means full peace of mind with every job we complete.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-6 bg-emerald-50 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">Eco-Conscious & Responsible</h3>
                      <p className="text-neutral-600">We operate under a zero-to-landfill promise, aiming to recycle, reuse, or donate 100% of what we clear. Waste is a resource, not a problem.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-primary/5 p-12 rounded-3xl">
                  <div className="text-center mb-8">
                    <img 
                      src={newVerticalColorLogoPath} 
                      alt="Lanora House logo" 
                      className="h-24 w-auto mx-auto mb-6"
                      loading="lazy"
                    />
                    <blockquote className="text-2xl italic text-neutral-700 mb-6 font-display">
                      "Making space. Reducing waste. Doing things the right way."
                    </blockquote>
                    <div className="text-sm text-neutral-500">– Our Mission</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-neutral-600">Zero to Landfill</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-neutral-600">Cleared</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Location */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display text-neutral-800 mb-6">Visit Us & Contact</h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Based in Hayle, Cornwall, proudly serving communities across Cornwall, Devon, and the wider South West
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white p-10 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-display text-neutral-800 mb-8">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-1">Auction Viewing Room & Office</h4>
                      <p className="text-neutral-600">
                        <strong>Unit 12b, The Old Foundry Chapel</strong><br />
                        Chapel Terrace<br />
                        Hayle, Cornwall TR27 4AB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-1">Service Coverage</h4>
                      <p className="text-neutral-600">Hayle, Cornwall<br />Serving: Cornwall, Devon, and surrounding areas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-1">Contact</h4>
                      <p className="text-neutral-600">Phone / WhatsApp: +44 7843 930927<br />Email: info@lanorahouse.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-1">Response Time</h4>
                      <p className="text-neutral-600">Quote requests: Within 24 hours<br />Emergency clearance: Same day when possible</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-blue-50 rounded-3xl p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-display text-neutral-800 mb-2">Our Service Area</h3>
                    <p className="text-neutral-600">Cornwall, Devon & Beyond</p>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d326186.0841856184!2d-4.9756485!3d50.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486b2b1e3a8b5555%3A0x2e4d4b4b4b4b4b4b!2sCornwall%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk&center=50.4,-4.5&zoom=8"
                      width="100%" 
                      height="300" 
                      style={{ border: 0 }} 
                      allowFullScreen={false} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Cornwall and Devon Service Area"
                    ></iframe>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-neutral-600">Based in Hayle, serving the South West</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-neutral-wood text-neutral-ivory relative overflow-hidden">
        <div className="absolute inset-0 "></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <img 
              src={horizontalWhiteLogoPath} 
              alt="Lanora House logo" 
              className="h-16 w-auto mx-auto mb-8"
              loading="lazy"
            />
            <h2 className="text-4xl md:text-5xl font-display mb-8">Ready to Clear Your Space?</h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed">
              Whether it's a simple shed clearance or a complex commercial project, we're here to help. Let Us Clear The Way, Fast & Hassle Free!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/contact" 
                className="bg-secondary text-neutral-800 px-10 py-4 rounded-full font-semibold hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                Get Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}