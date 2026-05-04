import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { 
  Ticket,
  CheckCircle,
  CreditCard,
  Clock,
  Shield,
  Users,
  Trophy,
  Phone,
  Mail,
  ArrowRight,
  Gift,
  Sparkles,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const ClearanceRewardsGuide = () => {
  const steps = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      title: "Clearance Completed",
      description: "Once your clearance job is completed and the invoice paid, your account will be credited with 5% of your total bill."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Account Setup",
      description: "If you're a new customer, we'll automatically create an account for you and send your username and password by email or SMS."
    },
    {
      icon: <Ticket className="w-8 h-8 text-purple-600" />,
      title: "Use Your Credit",
      description: "You can use your credit to enter any raffles you like, in any quantity, at any time – your credit will not expire."
    }
  ];

  const rules = [
    {
      icon: <CreditCard className="w-6 h-6 text-red-600" />,
      title: "Credit Use & Withdrawals",
      points: [
        "Raffle credit cannot be withdrawn as cash. It must be used on raffle entries only.",
        "If you win a raffle prize, there is no requirement to spend any further credit to claim your prize.",
        "If you receive additional promotional credit, this will also be raffle-only and non-transferable."
      ]
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: "Redemption",
      points: [
        "You may use your credit across as many raffles as you like – there's no restriction.",
        "There's no time limit – your credit stays with you until you use it.",
        "We may run limited-time bonus raffles, but your credit will still apply if valid for that draw."
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Account Management",
      points: [
        "Each customer has one raffle account. If you use different emails, we may need to verify identity before merging credits.",
        "If you believe your account hasn't been credited after a job, please contact us with your invoice number and account email."
      ]
    }
  ];

  return (
    <TransitionWrapper>
      <div className="min-h-screen bg-white">
        <SEOHead
          title="Clearance Rewards Guide - Raffle Credit Explained"
          description="Complete guide to Lanora House clearance rewards. Learn how to earn and use raffle credit from your clearance bookings to enter exciting prize draws."
          path="/clearance-rewards-guide"
        />

        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-primary/10" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Ticket className="w-12 h-12 text-primary" />
                <Badge className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/20">
                  <Gift className="w-4 h-4 mr-2" />
                  Raffle Credit Guide
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
                Raffle Credit – Find Out More
              </h1>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-primary/10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                  Your clearance, your reward – spend it on prizes you actually want!
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  When you book a clearance service with Lanora House, <span className="font-bold text-primary">5% of the value of your final bill</span> is credited to your personal Lanora Raffle Account. This credit can then be used to purchase tickets in any of our prize draws.
                </p>
                <p className="text-lg text-gray-600 mt-4">
                  Whether it's a luxury stay, local experience, or fun giveaway – you choose how to spend your credit! <a href="tel:+447843930927" className="text-primary hover:underline">Contact us</a> to book your clearance and start earning.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                  asChild
                >
                  <Link href="/clearance">
                    Book Your Clearance
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4 h-auto"
                  asChild
                >
                  <Link href="/raffles">
                    View Current Raffles
                    <Trophy className="w-5 h-5 ml-3" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <StaggeredContainer>
              <div className="text-center mb-12">
                <StaggeredItem>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                </StaggeredItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <StaggeredItem key={index}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary group hover:-translate-y-1">
                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                          {step.icon}
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-3">
                          {index + 1}
                        </div>
                        <CardTitle className="text-xl font-bold leading-tight">
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-center leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </div>
            </StaggeredContainer>
          </div>
        </section>

        {/* Terms & Rules Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <StaggeredContainer>
              <div className="text-center mb-12">
                <StaggeredItem>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Important Terms & Rules</h2>
                  <p className="text-xl text-gray-600">
                    To keep things fair and easy to manage, here are the key rules that apply:
                  </p>
                </StaggeredItem>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {rules.map((rule, index) => (
                  <StaggeredItem key={index}>
                    <Card className="h-full border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          {rule.icon}
                          <CardTitle className="text-lg font-bold">
                            {rule.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {rule.points.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </div>
            </StaggeredContainer>
          </div>
        </section>

        {/* Example Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <StaggeredContainer>
              <div className="text-center mb-12">
                <StaggeredItem>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Example</h2>
                </StaggeredItem>
              </div>

              <StaggeredItem>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <p className="text-lg">You book a house clearance for <span className="font-bold text-primary">£500</span>.</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-6 h-6 text-primary ml-1" />
                        <p className="text-lg">You receive <span className="font-bold text-primary">£25</span> in raffle credit</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-6 h-6 text-primary ml-1" />
                        <p className="text-lg">You use it to buy 5 tickets at £5 each for a spa retreat draw</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-6 h-6 text-primary ml-1" />
                        <p className="text-lg">You win!</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-6 h-6 text-primary ml-1" />
                        <p className="text-lg">You still have £0 credit left, but your account is active for future bookings and prizes.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-primary text-white rounded-3xl p-12 shadow-2xl"
            >
              <Star className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Questions?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                We'll be happy to help you make the most of your rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto"
                >
                  <a href="mailto:info@lanorahouse.com" className="flex items-center">
                    <Mail className="w-5 h-5 mr-3" />
                    Email: info@lanorahouse.com
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto"
                >
                  <a href="tel:+447843930927" className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    Call: +44 7843 930927
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </TransitionWrapper>
  );
};

export default ClearanceRewardsGuide;