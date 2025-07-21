import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth-modal";
import { 
  Shield, 
  Zap, 
  Headphones, 
  CreditCard, 
  TrendingUp, 
  Globe, 
  Lock, 
  CheckCircle, 
  DollarSign, 
  Users, 
  ArrowRight,
  Smartphone,
  Clock,
  Award,
  ChevronDown,
  Star,
  Building,
  PiggyBank
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Check if mobile menu is open and the click is outside the menu
      if (mobileMenuOpen) {
        const menu = document.getElementById('mobile-menu');
        const menuButton = document.getElementById('menu-button');
        
        if (menu && !menu.contains(e.target as Node) && 
            menuButton && !menuButton.contains(e.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    // Add event listener when menu is open
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  // Optional: Redirect if already authenticated (commented out to allow viewing landing page)
  // if (user) {
  //   if (user.isAdmin) {
  //     setLocation("/admin");
  //   } else {
  //     setLocation("/dashboard");
  //   }
  //   return null;
  // }

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const faqData = [
    {
      question: "How secure is my money with SecureBank?",
      answer: "Your deposits are protected by advanced encryption, multi-factor authentication, and are insured up to $750,000 per account. We use military-grade security protocols to safeguard your financial information."
    },
    {
      question: "What fees does SecureBank charge?",
      answer: "We believe in transparent pricing. There are no monthly maintenance fees for our standard checking account, no ATM fees worldwide, and no hidden charges. You only pay for premium services you choose to use."
    },
    {
      question: "How long does account approval take?",
      answer: "Most account applications are reviewed and approved within 24-48 hours, although some may take up to 7 business days. You will receive notifications at each stage of the process and can track the status of your application in real-time chat through your account dashboard. Be sure to keep an eye on the message section of your dashboard for timely updates."
    },
    {
      question: "Can I access my account internationally?",
      answer: "Yes! SecureBank provides global access to your accounts through our web app/online platform. We support transactions in 150+ countries with competitive exchange rates."
    },
    {
      question: "What customer support options are available?",
      answer: "We offer 24/7 customer support through live chat, phone, and email. Our dedicated support team is always ready to help with any questions or concerns you may have."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    SecureBank
                  </span>
                  <div className="text-xs text-gray-500 -mt-1">Professional Banking</div>
                </div>
              </button>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Testimonials</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">FAQ</a>
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600">Welcome, {user.firstName}</span>
                  <Button 
                    onClick={() => setLocation(user.isAdmin ? "/admin" : "/dashboard")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button onClick={handleSignIn} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Sign In
                  </Button>
                  <Button onClick={handleSignUp} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    Open Account
                  </Button>
                </div>
              )}
            </div>
            <div className="lg:hidden">
              <button 
                id="menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu - Changed to slide from right */}
          {mobileMenuOpen && (
            <div 
              id="mobile-menu"
              className="lg:hidden fixed top-20 right-0 bottom-0 w-64 bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out"
            >
              <div className="px-4 pt-4 pb-6 space-y-3">
                <a 
                  href="#services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Services
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Testimonials
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  FAQ
                </a>
                <div className="pt-4 space-y-2">
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-gray-600 text-center">
                        Welcome, {user.firstName}
                      </div>
                      <Button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setLocation(user.isAdmin ? "/admin" : "/dashboard");
                        }} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignIn();
                        }} 
                        variant="outline" 
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignUp();
                        }} 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        Open Account
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Removed the blue background Quick Access Info section */}

      {/* Hero Section - Improved responsiveness and made account card bigger */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 text-center md:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                #1 Rated Digital Bank 2024
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Banking
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                  Reimagined
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                Experience the future of banking with our cutting-edge platform. Secure, fast, and designed for your financial success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  onClick={handleSignUp}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => {
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  FDIC Insured
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No Hidden Fees
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  24/7 Support
                </div>
              </div>
            </div>
            <div className="relative mt-6 md:mt-0 mx-auto md:mx-0 max-w-md sm:max-w-lg lg:max-w-2xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl opacity-10 blur-xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-100">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Main Account</h3>
                        <p className="text-sm text-gray-500">**** 8492</p>
                      </div>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">$12,486.43</div>
                      <div className="text-sm text-green-600">+2.5% this month</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Savings</span>
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-green-900">$8,234.12</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                        <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Investment</span>
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-blue-900">$15,692.85</div>
                    </div>
                  </div>
                  
                  {/* Recent Transactions */}
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <Smartphone className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Apple Store</p>
                            <p className="text-xs text-gray-500">Jul 18, 2024</p>
                          </div>
                        </div>
                        <span className="font-medium text-gray-800">-$129.99</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Salary Deposit</p>
                            <p className="text-xs text-gray-500">Jul 15, 2024</p>
                          </div>
                        </div>
                        <span className="font-medium text-green-600">+$3,450.00</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex justify-between items-center">
                    <button className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Transfer
                    </button>
                    <button className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Pay
                    </button>
                    <button className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      Invest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Modern Banking
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From everyday banking to investment management, we provide comprehensive financial solutions tailored to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description: "Advanced encryption and multi-factor authentication protect your assets with military-grade security protocols.",
                color: "blue"
              },
              {
                icon: Smartphone,
                title: "Mobile Banking",
                description: "Full-featured web app with biometric login, instant notifications, and seamless transaction management.",
                color: "green"
              },
              {
                icon: Globe,
                title: "Global Access",
                description: "Access your accounts worldwide with no international fees and real-time currency exchange.",
                color: "purple"
              },
              {
                icon: TrendingUp,
                title: "Investment Platform",
                description: "Build wealth with our integrated investment tools, robo-advisors, and expert portfolio management.",
                color: "orange"
              },
              {
                icon: Clock,
                title: "Instant Transfers",
                description: "Send money instantly to anyone, anywhere. Zero fees for transfers between SecureBank accounts.",
                color: "red"
              },
              {
                icon: Headphones,
                title: "24/7 Expert Support",
                description: "Connect with our financial experts anytime through chat, phone, or video consultation.",
                color: "indigo"
              }
            ].map((service, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className={`w-16 h-16 bg-${service.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`w-8 h-8 text-${service.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Millions Worldwide</h2>
            <p className="text-xl text-blue-100">Join the growing community of satisfied SecureBank customers</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "2.5M+", label: "Active Customers", icon: Users },
              { number: "$50B+", label: "Assets Under Management", icon: DollarSign },
              { number: "150+", label: "Countries Served", icon: Globe },
              { number: "99.9%", label: "Uptime Guarantee", icon: Shield }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real stories from real customers who trust SecureBank</p>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 pb-4 px-4" style={{ width: 'max-content' }}>
              {[
                {
                  name: "Sarah Johnson",
                  role: "Small Business Owner",
                  content: "SecureBank transformed how I manage my business finances. The integration between personal and business accounts is seamless.",
                  rating: 5
                },
                {
                  name: "Michael Chen",
                  role: "Software Engineer",
                  content: "The web app is incredible. I can handle all my banking needs on the go with the security and features I need.",
                  rating: 5
                },
                {
                  name: "Emma Williams",
                  role: "Marketing Director",
                  content: "Customer service is outstanding. They're always available when I need help, and the response time is amazing.",
                  rating: 5
                },
                {
                  name: "David Rodriguez",
                  role: "Freelance Designer",
                  content: "The instant transfers and low fees have made managing client payments so much easier. Highly recommend SecureBank!",
                  rating: 5
                },
                {
                  name: "Lisa Thompson",
                  role: "Restaurant Owner",
                  content: "Their business banking solutions helped streamline our financial operations. The support team is incredibly knowledgeable.",
                  rating: 5
                },
                {
                  name: "James Park",
                  role: "Tech Startup Founder",
                  content: "As a growing startup, we needed reliable banking. SecureBank's scalable solutions grew with our business perfectly.",
                  rating: 5
                },
                {
                  name: "Maria Garcia",
                  role: "Financial Advisor",
                  content: "I recommend SecureBank to all my clients. Their investment platform and financial tools are top-notch.",
                  rating: 5
                },
                {
                  name: "Robert Kim",
                  role: "E-commerce Entrepreneur",
                  content: "International transactions are seamless with SecureBank. No hidden fees and excellent exchange rates.",
                  rating: 5
                },
                {
                  name: "Jennifer Walsh",
                  role: "Nonprofit Director",
                  content: "SecureBank's transparent pricing and dedicated nonprofit support have been invaluable for our organization.",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg flex-shrink-0 w-80">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers to common questions about SecureBank</p>
          </div>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Fixed button coloring */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join millions of satisfied customers and experience the future of banking today. Open your account in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleSignUp}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-semibold transition-colors"
            >
              Open Your Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={handleSignIn}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto font-semibold transition-all duration-200"
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">SecureBank</span>
                  <div className="text-sm text-gray-400 -mt-1">Professional Banking</div>
                </div>
              </button>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Your trusted partner in modern banking solutions. We're committed to providing secure, innovative financial services that help you achieve your goals.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <span className="text-sm font-semibold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <span className="text-sm font-semibold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <span className="text-sm font-semibold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-6 text-lg">Products</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Personal Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Loans & Mortgages</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Credit Cards</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-6 text-lg">Support</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-6 text-lg">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">&copy; 2024 SecureBank. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <span>FDIC Insured</span>
                <span>Equal Housing Lender</span>
                <span>Member FDIC</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}