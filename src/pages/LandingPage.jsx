import { useNavigate } from 'react-router-dom'
import { Phone, Zap, Globe, TrendingUp, Lock, Settings } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Phone,
      title: 'AI-Powered Calling',
      description: 'Intelligent voice agents that handle customer interactions naturally and efficiently'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Seamlessly communicate in English, Hindi, and Hinglish'
    },
    {
      icon: Zap,
      title: 'Instant Demo Calls',
      description: 'Experience real-time product demonstrations over a phone call'
    },
    {
      icon: TrendingUp,
      title: 'Scalable Solution',
      description: 'Perfect for any industry - from insurance to tech support'
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee'
    },
    {
      icon: Settings,
      title: 'Customizable',
      description: 'Tailor the agent behavior for your specific use case'
    }
  ]

  const useCases = [
    { title: 'Insurance', description: 'Demo new insurance products to prospects' },
    { title: 'SaaS', description: 'Give product walkthroughs over calls' },
    { title: 'Healthcare', description: 'Provide appointment scheduling assistance' },
    { title: 'Education', description: 'Deliver course information and enrollment' },
    { title: 'Retail', description: 'Customer support and product recommendations' },
    { title: 'Finance', description: 'Financial advisory and consultation calls' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">CallAgent</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/bulk')}
              className="text-white/80 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              Bulk Call
            </button>
            <button
              onClick={() => navigate('/admin/calls')}
              className="text-white/80 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              Admin
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Get Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
          AI-Powered Calling Agent for <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">Every Business</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Automate your customer interactions with intelligent voice agents that understand context, speak naturally, and convert leads into customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/demo')}
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
          >
            Request Demo Call
          </button>
          <button
            className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-4xl font-bold text-center text-white mb-16">Why CallAgent?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 hover:border-white/40 transition hover:bg-white/15"
              >
                <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg p-3 w-fit mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-4xl font-bold text-center text-white mb-16">Works for Any Industry</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-pink-500/20 to-blue-500/20 border border-white/20 rounded-lg p-6 hover:border-white/40 transition"
            >
              <h4 className="text-lg font-bold text-white mb-2">{useCase.title}</h4>
              <p className="text-gray-300">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/5 backdrop-blur-md border-y border-white/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text mb-2">10K+</p>
              <p className="text-gray-300">Demo Calls</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text mb-2">95%</p>
              <p className="text-gray-300">Success Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text mb-2">50+</p>
              <p className="text-gray-300">Industries</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text mb-2">24/7</p>
              <p className="text-gray-300">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Sales?</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Get a personalized demo call tailored to your business needs. Our AI agent will show you exactly how we can help.
        </p>
        <button
          onClick={() => navigate('/demo')}
          className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
        >
          Schedule Demo Call Now
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2026 CallAgent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
