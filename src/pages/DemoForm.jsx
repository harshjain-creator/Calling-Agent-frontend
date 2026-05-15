import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react'

export default function DemoForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    scenario: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success', 'error', null
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage('Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      setMessage('Please enter your email')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email')
      return false
    }
    if (!formData.phone.trim()) {
      setMessage('Please enter your phone number')
      return false
    }
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setMessage('Phone number must be 10 digits')
      return false
    }
    if (!formData.scenario.trim()) {
      setMessage('Please describe your call scenario')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setMessage('')

    if (!validateForm()) {
      setStatus('error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8002/demo_call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone,
          scenario: formData.scenario,
        })
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        setStatus('success')
        setMessage('Demo call initiated! You will receive a call shortly.')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          scenario: '',
        })
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || data.message || 'Failed to initiate call. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check if the backend is running and try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const scenarioTemplates = [
    'I am a female customer support agent from ABC Insurance, a leading insurance provider. Call the customer to introduce our latest health insurance product.',
    'I am calling from a SaaS company to give a 10-minute product demo about our project management tool.',
    'I am calling from an e-commerce company to offer a special discount and get feedback on a new product.',
    'I am calling from a fitness center to introduce our new gym membership plans.',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-gray-300 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Get a Demo Call</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Details */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-6">Contact Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Full Name <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Email <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Phone Number <span className="text-pink-400">*</span>
                      </label>
                      <div className="flex gap-2 min-w-0 w-full">
                        <span className="flex items-center px-3 rounded-lg bg-white/5 border border-white/20 text-gray-400 whitespace-nowrap flex-shrink-0">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          maxLength="10"
                          className="flex-1 min-w-0 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg p-3">
                    🌐 AI agent greets in English and auto-switches to the language you speak — English, Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, Malayalam, Punjabi, Odia.
                  </div>
                </div>
              </div>

              {/* Call Scenario */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-6">Describe Your Call Scenario</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white mb-2">
                    What would you like the AI agent to demonstrate or discuss? <span className="text-pink-400">*</span>
                  </label>
                  <textarea
                    name="scenario"
                    value={formData.scenario}
                    onChange={handleChange}
                    placeholder="E.g., I am calling from an insurance company to introduce a new health insurance product..."
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition resize-none"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Use Sample Scenarios:</p>
                  <div className="space-y-2">
                    {scenarioTemplates.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, scenario: template }))}
                        className="w-full text-left px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-gray-300 hover:border-blue-400 hover:bg-white/10 transition text-sm"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-400">Success!</p>
                    <p className="text-green-300 text-sm">{message}</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400">Error</p>
                    <p className="text-red-300 text-sm">{message}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 rounded-lg transition transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Initiating Call...
                  </>
                ) : (
                  'Call Me Now'
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                By clicking "Call Me Now", you agree to receive a phone call from our AI agent. We'll call you immediately at the number you provided.
              </p>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-pink-500/20 to-blue-500/20 border border-white/20 rounded-lg p-8 sticky top-20">
              <h3 className="text-xl font-bold text-white mb-4">What to Expect</h3>
              <ul className="space-y-4 text-gray-300 text-sm">
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>You'll receive a call within 1-2 minutes</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Our AI agent speaks naturally in your preferred language</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>The call is completely customized to your scenario</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>No commitment needed - it's just a demo</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Talk to our team after the call</span>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-gray-400 mb-3">📞 <strong>Have questions?</strong></p>
                <a href="mailto:support@callagent.com" className="text-blue-400 hover:text-blue-300 text-sm">
                  support@callagent.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
