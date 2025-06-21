"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import {
  Brain,
  Target,
  Zap,
  Users,
  Trophy,
  Sparkles,
  Heart,
  Lightbulb,
  Rocket,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react"

export default function AboutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const whyWeBuilt = [
    {
      icon: Brain,
      title: "Learning Should Be Addictive",
      description:
        "We noticed that people spend hours scrolling through social media but struggle to study for 30 minutes. We wanted to make learning as engaging as binge-watching your favorite series.",
      color: "from-emerald-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "One-Size-Fits-All Doesn't Work",
      description:
        "Traditional education treats everyone the same. We believe in personalized learning that adapts to your pace, style, and interests using cutting-edge AI technology.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Zap,
      title: "Knowledge Should Be Accessible",
      description:
        "Quality education shouldn't be limited by geography or financial status. We're democratizing learning by making it free, fun, and available to anyone with an internet connection.",
      color: "from-blue-500 to-purple-500",
    },
  ]

  const whyUseUs = [
    {
      icon: Sparkles,
      title: "AI-Powered Personalization",
      description: "Our advanced AI creates custom learning paths tailored to your unique learning style and goals.",
      stats: "98% accuracy",
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn points, climb leaderboards, and unlock achievements while mastering new skills.",
      stats: "5x engagement",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Join millions of learners worldwide in battles, discussions, and collaborative study sessions.",
      stats: "50K+ active users",
    },
    {
      icon: Rocket,
      title: "Proven Results",
      description: "Students using MindSnap show 40% faster learning and 85% better retention rates.",
      stats: "40% faster learning",
    },
    {
      icon: Globe,
      title: "Multi-Format Support",
      description: "Learn from YouTube videos, PDFs, articles, or any content format with our smart conversion.",
      stats: "Any content type",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We never sell your information or compromise your privacy.",
      stats: "100% secure",
    },
  ]

  const teamMembers = [
    {
      name: "Sayan Adhikary (Team Lead)",
      role: "Fullstack & Blockchain Developer",
      avatar: "/sayan.jpg",
      skills: ["Web3", "Product Strategy", "Leadership"],
      social: {
        linkedin: "https://www.linkedin.com/in/sayanadk/",
        twitter: "https://x.com/reejouu",
        github: "https://github.com/reejouu",
      },
      color: "from-emerald-500 to-cyan-500",
    },
    {
      name: "Devayanee Gupta",
      role: "Backend Developer",
      avatar: "/devayanee.jpg",
      skills: ["AI Integration", "System Design"],
      social: {
        linkedin: "https://www.linkedin.com/in/dg2805/",
        twitter: "https://x.com/d_gupta_05",
        github: "https://github.com/dg-2805",
      },
      color: "from-cyan-500 to-blue-500",
    },
    {
      name: "Sanchayan Khan",
      role: "Frontend Developer",
      avatar: "/sanchayan.jpg",
      skills: ["UX/UI Design",  "Prototyping"],
      social: {
        linkedin: "https://www.linkedin.com/in/sanchayan-khan/",
        twitter: "https://x.com/sanchayan_kn",
        github: "https://github.com/snch404",
      },
      color: "from-blue-500 to-purple-500",
    },
    {
      name: "Kaniska Mitra",
      role: "Frontend Developer",
      avatar: "/kaniska.jpg",
      skills: ["UI/UX", "Research"],
      social: {
        linkedin: "https://www.linkedin.com/in/kaniskamitra/",
        twitter: "https://x.com/JustKaniskaTbh",
        github: "https://github.com/Kaniska1",
      },
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showSidebarToggle={false} />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <div className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              About{" "}<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                MindSnap
            </span>
            </div>
            
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to make learning as addictive as your favorite social media platform.
            <span className="text-emerald-400 font-semibold"> Because education should be irresistible.</span>
          </p>
        </motion.div>

        {/* Why We Built This Section */}
        <section className="mb-24">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why We Built{" "}
              </span>
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                MindSnap
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Every great product starts with a problem. Here's the problem we're solving and why it matters to us.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyWeBuilt.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-emerald-500/30 transition-all duration-500 hover:scale-105 h-full group backdrop-blur-sm">
                  <CardContent className="p-8 text-center space-y-6">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Use MindSnap Section */}
        <section className="mb-24">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Students Love{" "}
              </span>
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                MindSnap
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We're not just another learning platform. Here's what makes us different and why thousands of students
              choose us every day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUseUs.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-cyan-500/30 transition-all duration-500 hover:scale-105 h-full group backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                        {feature.stats}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { icon: Users, label: "Active Learners", value: "50K+", color: "text-emerald-400" },
              { icon: BookOpen, label: "Cards Created", value: "2M+", color: "text-cyan-400" },
              { icon: Trophy, label: "Battles Fought", value: "100K+", color: "text-purple-400" },
              { icon: TrendingUp, label: "Success Rate", value: "98%", color: "text-yellow-400" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Team Section */}
        <section className="mb-24">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Meet the Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                The Minds Behind
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                MindSnap
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We're a diverse team of educators, engineers, and dreamers united by one goal: making learning
              irresistible for everyone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-purple-500/30 transition-all duration-500 hover:scale-105 h-full group backdrop-blur-sm">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${member.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden`}
                      >
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {member.name}
                      </h3>
                      <p className="font-medium mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {member.role}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        {member.skills.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-center space-x-4">
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700/50 hover:bg-blue-500/20 rounded-full flex items-center justify-center transition-colors group/social"
                        >
                          <Linkedin className="w-4 h-4 text-gray-400 group-hover/social:text-blue-400" />
                        </a>
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700/50 hover:bg-cyan-500/20 rounded-full flex items-center justify-center transition-colors group/social"
                        >
                          <Twitter className="w-4 h-4 text-gray-400 group-hover/social:text-cyan-400" />
                        </a>
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700/50 hover:bg-emerald-500/20 rounded-full flex items-center justify-center transition-colors group/social"
                        >
                          <Github className="w-4 h-4 text-gray-400 group-hover/social:text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="text-center py-20 bg-gradient-to-r from-emerald-900/20 via-cyan-900/20 to-emerald-900/20 rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Join Our
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Learning Revolution?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who've already transformed their study habits with MindSnap. Your learning
              journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-10 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 group"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center space-x-2 text-gray-400">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">Want to Get in Touch?</h3>
          <p className="text-gray-400 mb-6">
            We'd love to hear from you! Whether you have questions, feedback, or just want to say hi.
          </p>
          <Button
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
        </motion.section>
      </div>
    </div>
  )
}
