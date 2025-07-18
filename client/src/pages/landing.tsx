import { useState } from "react";
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

  // Redirect if already authenticated
  if (user) {
    if (user.isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
    return null;
  }

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
      answer: "Your deposits are protected by advanced encryption, multi-factor authentication, and are insured up to $250,000 per account. We use military-grade security protocols to safeguard your financial information."
    },
    {
      question: "What fees does SecureBank charge?",
      answer: "We believe in transparent pricing. There are no monthly maintenance fees for our standard checking account, no ATM fees worldwide, and no hidden charges. You only pay for premium services you choose to use."
    },
    {
      question: "How long does account approval take?",
      answer: "Most account applications are reviewed and approved within 24-48 hours. You'll receive email notifications throughout the process and can track your application status in real-time."
    },
    {
      question: "Can I access my account internationally?",
      answer: "Yes! SecureBank provides global access to your accounts through our mobile app and online platform. We support transactions in 150+ countries with competitive exchange rates."
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    SecureBank
                  </span>
                  <div className="text-xs text-gray-500 -mt-1">Professional Banking</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#personal" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Personal</a>
              <a href="#business" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Business</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#support" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Support</a>
              <div className="flex items-center space-x-3">
                <Button onClick={handleSignIn} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Sign In
                </Button>
                <Button onClick={handleSignUp} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Open Account
                </Button>
              </div>
            </div>
            <div className="lg:hidden">
              <button className="text-gray-700 hover:text-blue-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                #1 Rated Digital Bank 2024
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Banking
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Experience the future of banking with our cutting-edge platform. Secure, fast, and designed for your financial success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSignUp}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-6 h-auto"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto"
                >
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-600">
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
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl opacity-10 blur-xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Main Account</h3>
                        <p className="text-sm text-gray-500">**** 8492</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">$12,486.43</div>
                      <div className="text-sm text-green-600">+2.5% this month</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Savings</span>
                      </div>
                      <div className="text-lg font-bold text-green-900 mt-1">$8,234.12</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <PiggyBank className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Investment</span>
                      </div>
                      <div className="text-lg font-bold text-blue-900 mt-1">$15,692.85</div>
                    </div>
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
                description: "Full-featured mobile app with biometric login, instant notifications, and seamless transaction management.",
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real stories from real customers who trust SecureBank</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
                content: "The mobile app is incredible. I can handle all my banking needs on the go with the security and features I need.",
                rating: 5
              },
              {
                name: "Emma Williams",
                role: "Marketing Director",
                content: "Customer service is outstanding. They're always available when I need help, and the response time is amazing.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
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

      {/* CTA Section */}
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
              className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-6 h-auto"
            >
              Open Your Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={handleSignIn}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto"
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
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">SecureBank</span>
                  <div className="text-sm text-gray-400 -mt-1">Professional Banking</div>
                </div>
              </div>
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