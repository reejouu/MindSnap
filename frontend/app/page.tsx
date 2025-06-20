"use client"

import { Button } from "@/components/ui/button"
import { HeroHighlight, Highlight } from "@/components/hero-highlight"
import {
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  Trophy,
  Twitter,
  Github,
  Linkedin,
  Upload,
  EyeOff,
  PenTool,
  BarChart3,
  Play,
  Star,
  Users,
  CheckCircle,
  ArrowDown,
  Lightbulb,
  Rocket,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/navbar"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
export default function MindSnapLanding() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const[sidebarOpen, setSidebarOpen]=useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-animate")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Upload,
      title: "Smart Content Import",
      description:
        "Transform any content - YouTube videos, PDFs, articles, or raw text - into engaging learning experiences with our advanced AI processing.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI-Powered SnapCards",
      description:
        "Get personalized, bite-sized learning cards with interactive elements, visual aids, and progressive difficulty that adapts to your learning style.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: EyeOff,
      title: "Focus Training Mode",
      description:
        "Build laser-sharp concentration with our distraction-free environment. Track your focus time and earn rewards for sustained attention.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: PenTool,
      title: "Adaptive Quizzes",
      description:
        "Smart quizzes that evolve with your progress, targeting weak areas and reinforcing strengths for maximum retention and understanding.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description:
        "Climb leaderboards, earn achievement badges, and unlock rewards as you progress. Make learning addictive and fun.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Deep insights into your learning patterns, progress tracking, and personalized recommendations to optimize your study sessions.",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      content:
        "MindSnap transformed how I study. I went from struggling with textbooks to acing my exams with 40% less study time.",
      rating: 5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      content:
        "The AI-generated cards are incredibly smart. It's like having a personal tutor that knows exactly what I need to learn.",
      rating: 5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Emily Watson",
      role: "MBA Student",
      content:
        "The gamification aspect keeps me motivated. I actually look forward to studying now - it's become addictive!",
      rating: 5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white overflow-x-hidden">
      <Navbar sidebarOpen={sidebarOpen}  setSidebarOpen={setSidebarOpen} showSidebarToggle={false}/>

      {/* Hero Section */}
      <HeroHighlight>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
          <div className="text-center space-y-8">
            {/* Hero Badge */}
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">AI-Powered Learning Revolution</span>
            </div>

            {/* Main Headline */}
            <div
              className={`space-y-6 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                  Learn Like You
                </span>
                <br />
                
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Binge Content
                  </span>
                
              </h1>

                <TypewriterEffect
                words={[
                  {
                  text: "Transform",
                  className: "text-emerald-400",
                  },
                  {
                  text: "any",
                  className: "text-cyan-400",
                  },
                  {
                  text: "content",
                  className: "text-emerald-400",
                  },
                  {
                  text: "into",
                  className: "text-cyan-400",
                  },
                  {
                  text: "addictive,",
                  className: "text-emerald-400",
                  },
                  {
                  text: "bite-sized",
                  className: "text-cyan-400",
                  },
                  {
                  text: "learning",
                  className: "text-emerald-400",
                  },
                  {
                  text: "experiences.",
                  className: "text-cyan-400",
                  },
                ]}
                className="text-base text-gray-300 max-w-5xl mx-auto leading-relaxed"
                />
              <p>
                <span className="text-2xl text-emerald-400 font-semibold"> Study smarter, not harder.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 group"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 font-semibold px-8 py-4 text-lg rounded-2xl group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div
              className={`grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-gray-400 text-sm">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  4.9★
                </div>
                <div className="text-gray-400 text-sm">User Rating</div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-16">
              <div className="flex flex-col items-center space-y-2 animate-bounce">
                <span className="text-gray-400 text-sm">Discover More</span>
                <ArrowDown className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </HeroHighlight>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-[#0a0f0a] to-[#0f1410]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Master Any Subject
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven learning science to create the
              ultimate study experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" ref={featuresRef}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`scroll-animate group p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-emerald-500/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#0f1410] to-[#0a0f0a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get Started in
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Upload Content",
                description: "Paste a YouTube link, upload a PDF, or enter any text you want to learn from.",
                icon: Upload,
                color: "from-emerald-500 to-cyan-500",
              },
              {
                step: "02",
                title: "AI Processing",
                description: "Our advanced AI breaks down your content into engaging, bite-sized learning cards.",
                icon: Brain,
                color: "from-cyan-500 to-blue-500",
              },
              {
                step: "03",
                title: "Start Learning",
                description: "Swipe through cards, take quizzes, and track your progress as you master the material.",
                icon: Target,
                color: "from-blue-500 to-purple-500",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="scroll-animate text-center group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative mb-8">
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-[#0a0f0a] to-[#0f1410]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Loved by Students
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="scroll-animate p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-purple-500/30 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-900/20 via-cyan-900/20 to-emerald-900/20">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <div className="scroll-animate">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Your Learning?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students who've already revolutionized their study habits with MindSnap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-10 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center space-x-2 text-gray-400">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-[#0a0f0a] to-[#0f1410] border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  MindSnap
                </span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Revolutionizing education through AI-powered learning experiences that make studying addictive and
                effective.
              </p>
              <div className="flex space-x-4">
                {[Twitter, Github, Linkedin].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-emerald-500/20 flex items-center justify-center cursor-pointer transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h5 className="font-semibold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                {["Features", "Pricing", "API", "Integrations"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-semibold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-semibold text-white mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                {["Help Center", "Community", "Privacy", "Terms"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 MindSnap. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
