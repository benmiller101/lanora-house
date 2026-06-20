import React from "react";
import SEOHead from "@/components/SEOHead";
import { 
  Shield, 
  CheckCircle, 
  Eye, 
  RefreshCw, 
  Lock, 
  Leaf, 
  HeadphonesIcon,
  Star,
  Award,
  Search,
  FileText,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

export default function AuthenticityGuarantee() {
  const guaranteeFeatures = [
    {
      icon: Eye,
      title: "Expert Verification & Professional Valuations",
      description: "Our dedicated team brings years of industry experience in antique and collectible valuations, vintage goods identification, and reclaimed materials expertise.",
      details: [
        "Detailed inspection for authenticity, quality, and condition",
        "Careful research and verification of age, provenance, and historical accuracy",
        "Professional appraisal and valuation to ensure fair pricing and transparency"
      ]
    },
    {
      icon: FileText,
      title: "Transparent & Accurate Descriptions",
      description: "We promise absolute honesty and transparency in how we describe our items. Each product listing includes clear photographs and accurate descriptions.",
      details: [
        "Condition details (including any damage or wear)",
        "Age and Provenance documentation",
        "Materials and craftsmanship details",
        "Any relevant history or unique stories behind the item"
      ]
    },
    {
      icon: RefreshCw,
      title: "Full Refund Guarantee for Authenticity Issues",
      description: "We're so confident in our expertise that we offer a full refund guarantee, including original shipping costs, if authenticity is ever proven inaccurate.",
      details: [
        "Contact us with detailed evidence of any concerns",
        "We will fully investigate your claim swiftly and professionally",
        "Full refund upon return of the item in its original condition if authenticity errors are confirmed"
      ]
    },
    {
      icon: Lock,
      title: "Secure, Trustworthy, and Ethical Transactions",
      description: "Lanora House is built on trust. We pride ourselves on integrity and maintaining an impeccable reputation.",
      details: [
        "Protected by our unwavering commitment to fairness",
        "Accurate and transparent pricing",
        "Ethical business practices throughout"
      ]
    },
    {
      icon: Leaf,
      title: "Sustainability & Authenticity Combined",
      description: "Our commitment to authenticity aligns seamlessly with our sustainability ethos, promoting sustainable reuse and preserving heritage items.",
      details: [
        "Verifying and accurately valuing antiques and vintage items",
        "Promoting sustainable reuse and reducing waste",
        "Preserving valuable heritage items for future generations"
      ]
    },
    {
      icon: HeadphonesIcon,
      title: "Dedicated Customer Support",
      description: "Our friendly and knowledgeable team is always available to provide further insight or assistance with authenticity questions.",
      details: [
        "Questions about authenticity and provenance",
        "Professional valuations and item details",
        "Expert guidance and assistance"
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="Authenticity Guarantee - Expert Verification"
        description="Lanora House Authenticity Guarantee: Expert verification, transparent descriptions, and full refund protection. Buy with confidence from Cornwall's trusted specialists."
        path="/authenticity-guarantee"
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <TransitionWrapper>
          <section className="bg-primary text-white py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/20 p-4 rounded-full">
                    <Shield className="w-12 h-12" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Authenticity Guarantee
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                  At Lanora House, authenticity, transparency, and customer trust are the foundations of everything we do.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Badge className="bg-white text-primary text-lg py-2 px-4">
                    <Award className="w-5 h-5 mr-2" />
                    Expert Verified
                  </Badge>
                  <Badge className="bg-white text-primary text-lg py-2 px-4">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Full Refund Protection
                  </Badge>
                  <Badge className="bg-white text-primary text-lg py-2 px-4">
                    <Star className="w-5 h-5 mr-2" />
                    Trusted Since Day One
                  </Badge>
                </div>
              </div>
            </div>
          </section>
        </TransitionWrapper>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Introduction */}
            <TransitionWrapper>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-6 text-primary">
                  Your Confidence is Our Priority
                </h2>
                <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  Whether it's furniture, antiques, reclaimed items, collectibles, or unique vintage pieces, 
                  our Authenticity Guarantee ensures that every item you purchase from us is exactly as 
                  described and fully authentic.
                </p>
              </div>
            </TransitionWrapper>

            {/* Guarantee Features */}
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {guaranteeFeatures.map((feature, index) => (
                <StaggeredItem key={index}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <feature.icon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-3 text-primary">
                            {feature.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </StaggeredItem>
              ))}
            </StaggeredContainer>

            {/* Claims Process */}
            <TransitionWrapper>
              <div className="bg-accent/5 rounded-2xl p-8 mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4 text-primary">
                    How to Make an Authenticity Claim
                  </h2>
                  <p className="text-lg text-gray-700">
                    Simple, swift, and professional process
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                    <p className="text-gray-600">
                      Reach out with detailed evidence of any authenticity concerns
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Investigation</h3>
                    <p className="text-gray-600">
                      We will fully investigate your claim swiftly and professionally
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Resolution</h3>
                    <p className="text-gray-600">
                      Full refund issued if authenticity errors are confirmed
                    </p>
                  </div>
                </div>
              </div>
            </TransitionWrapper>

            {/* Sustainability Connection */}
            <TransitionWrapper>
              <div className="bg-green-50 rounded-2xl p-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Leaf className="w-8 h-8 text-green-600" />
                      <h2 className="text-2xl font-bold text-green-800">
                        Authenticity Meets Sustainability
                      </h2>
                    </div>
                    <p className="text-green-700 text-lg leading-relaxed mb-6">
                      By verifying and accurately valuing antiques, vintage items, and reclaimed materials, 
                      we actively promote sustainable reuse, preserving valuable heritage items and reducing 
                      unnecessary waste.
                    </p>
                    <p className="text-green-600 font-semibold text-lg">
                      When you choose Lanora House, you choose authenticity and sustainability, together.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Expert Verification</h4>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Sustainable Reuse</h4>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Heritage Preservation</h4>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Waste Reduction</h4>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionWrapper>

            {/* Contact Section */}
            <TransitionWrapper>
              <div className="bg-primary text-white rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-6">
                  Questions About Authenticity?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Our friendly and knowledgeable team is always available to provide 
                  further insight or assistance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <a 
                    href="mailto:info@lanorahouse.com"
                    className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-4 px-6"
                  >
                    <Mail className="w-6 h-6" />
                    <span className="font-semibold">info@lanorahouse.com</span>
                  </a>
                  
                  <a 
                    href="tel:+447456809049"
                    className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-4 px-6"
                  >
                    <Phone className="w-6 h-6" />
                    <span className="font-semibold">+44 7456 809 049</span>
                  </a>
                </div>
              </div>
            </TransitionWrapper>

            {/* Final Statement */}
            <TransitionWrapper>
              <div className="text-center py-16">
                <h2 className="text-3xl font-bold mb-6 text-primary">
                  Your Satisfaction, Our Guarantee
                </h2>
                <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
                  At Lanora House, we're not just selling items—we're sharing history, craftsmanship, 
                  and character. Your confidence in us is paramount, and our comprehensive Authenticity 
                  Guarantee reflects our unwavering commitment to excellence, integrity, and customer satisfaction.
                </p>
                <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-8 py-4 rounded-full text-xl font-bold">
                  <Shield className="w-8 h-8" />
                  Choose Lanora House for authentic quality—guaranteed.
                </div>
              </div>
            </TransitionWrapper>
          </div>
        </section>
      </div>
    </>
  );
}