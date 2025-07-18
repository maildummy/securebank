import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth-modal";
import { Shield, Zap, Headphones } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-bank-blue-700">SecureBank</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#" className="text-gray-700 hover:text-bank-blue-700 px-3 py-2 text-sm font-medium">Personal</a>
              <a href="#" className="text-gray-700 hover:text-bank-blue-700 px-3 py-2 text-sm font-medium">Business</a>
              <a href="#" className="text-gray-700 hover:text-bank-blue-700 px-3 py-2 text-sm font-medium">Support</a>
              <Button onClick={handleSignIn} className="bg-bank-blue-600 hover:bg-bank-blue-700">
                Sign In
              </Button>
            </div>
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-bank-blue-700">
                <span className="sr-only">Open menu</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bank-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Banking That Works For You
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Experience secure, modern banking with 24/7 access to your accounts, instant transfers, and personalized financial insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSignUp}
                  size="lg"
                  className="bg-white text-bank-blue-700 hover:bg-gray-50 text-lg px-8 py-4 h-auto"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-bank-blue-700 text-lg px-8 py-4 h-auto"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern banking interface" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SecureBank?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced security, intuitive design, and 24/7 support make managing your finances effortless and secure.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-bank-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-bank-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-600">
                Multi-factor authentication and encryption protect your financial data with military-grade security.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Transfers</h3>
              <p className="text-gray-600">
                Send money instantly to anyone, anywhere. No fees, no delays, just seamless transactions.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Get help whenever you need it with our round-the-clock customer support team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-bank-blue-700 mb-2">2M+</div>
              <div className="text-gray-600">Trusted Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-bank-blue-700 mb-2">50M+</div>
              <div className="text-gray-600">Transactions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-bank-blue-700 mb-2">150+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-bank-blue-700 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">SecureBank</h4>
              <p className="text-gray-400">Your trusted partner in modern banking solutions.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Products</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Personal Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investments</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SecureBank. All rights reserved.</p>
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
