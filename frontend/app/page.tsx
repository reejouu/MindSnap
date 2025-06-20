"use client";
import { Button } from "@/components/ui/button";
import { HeroHighlight, Highlight } from "@/components/hero-highlight";
import {
  BookOpen,
  Zap,
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
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MindSnapLanding() {
  const [activeTab, setActiveTab] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    setShowHero(true);
  }, []);

  const features = [
  {
    icon: Upload, // icon for content input
    title: "Upload Anything",
    description: "Paste YouTube links, upload PDFs, or enter raw text — MindSnap turns it all into interactive learning.",
  },
  {
    icon: Brain, // icon for AI processing
    title: "AI-Generated SnapCards",
    description: "Your content is broken into bite-sized, swipeable cards with cliffhangers, visuals, and quizzes.",
  },
  {
    icon: EyeOff, // icon for focus or attention
    title: "Attention Training Mode",
    description: "Build real focus with distraction-free learning. The longer you stay, the more you earn.",
  },
  {
    icon: PenTool, // quiz or test-based icon
    title: "Quizzes That Stick",
    description: "Quick, adaptive quizzes at the end of each SnapCard to boost retention and keep you engaged.",
  },
  {
    icon: Trophy, // icon for gamification/rewards
    title: "Earn Token Rewards",
    description: "Climb the leaderboard and get rewarded with tokens for reading, quiz accuracy, and learning streaks.",
  },
  {
    icon: BarChart3, // progress and analytics icon
    title: "Track Your Progress",
    description: "Monitor your learning stats, focus time, scores, and personalized topic recommendations in your dashboard.",
  },
];


  return (
    <div className="min-h-screen">
      {/* Only render the rest of the page after showHero is true (client-side) */}
      {showHero ? (
        <>
          <HeroHighlight>
            {/* Navbar - fixed full width */}
            <div className="fixed left-0 right-0 top-0 z-50">
              <Navbar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                showSidebarToggle={false}
              />
            </div>
            {/* Floating background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "4s" }}
              ></div>
            </div>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full scrollbar-hide">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-screen py-16">
                {/* Left Content */}
                <div className="space-y-10 relative">
                  {/* Decorative elements */}
                  <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl animate-pulse"></div>

                  <div className="space-y-8 relative z-10">
                    <h2 className="text-5xl lg:text-8xl font-black leading-[0.9] tracking-tight">
                      <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient bg-300% relative">
                        Learn fast,
                        <br />
                        stay{" "}
                      </span>
                      <Highlight className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 relative">
                        <span className="relative z-10">curious</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg blur-sm"></div>
                      </Highlight>
                    </h2>

                    <div className="space-y-4">
                      <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent">
                        Binge knowledge like you binge reels.
                      </p>
                      <p className="text-lg text-text/60 max-w-lg leading-relaxed">
                        Transform your learning experience with AI-powered
                        flashcards that adapt to your pace and style.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white font-bold px-10 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 group relative overflow-hidden"
                    >
                      <Link href="/dashboard">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10 flex items-center">
                        Get Started Free
                        <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                      </span>
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-primary/30 hover:border-primary/60 text-primary hover:text-primary/80 font-semibold px-8 py-6 text-lg rounded-2xl backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 group"
                    >
                      <span className="flex items-center">
                      Watch Demo
                      <div className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      </span>
                    </Button>
                  </div>

                  {/* Stats or features */}
                  <div className="flex items-center gap-8 pt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">10K+</div>
                      <div className="text-sm text-text/60">Active Learners</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">95%</div>
                      <div className="text-sm text-text/60">Retention Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        4.9★
                      </div>
                      <div className="text-sm text-text/60">User Rating</div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Enhanced Visual */}
                <div className="flex justify-center lg:justify-end relative mt-[-2rem] lg:mt-[-3rem]">
                  <div className="relative">
                    {/* Outer glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-full blur-3xl scale-110 animate-pulse"></div>

                    {/* Main circular container */}
                    <div className="w-96 h-96 lg:w-[28rem] lg:h-[28rem] rounded-full bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 backdrop-blur-xl border-2 border-primary/20 flex items-center justify-center relative overflow-hidden shadow-2xl">
                      {/* Animated background rings */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse"></div>
                      <div
                        className="absolute inset-6 rounded-full border-2 border-primary/30 shadow-inner"
                        style={{
                          animation: "spin 30s linear infinite",
                        }}
                      ></div>
                      <div
                        className="absolute inset-12 rounded-full border border-accent/20"
                        style={{
                          animation: "spin 20s linear infinite reverse",
                        }}
                      ></div>
                      <div
                        className="absolute inset-16 rounded-full border border-secondary/15"
                        style={{
                          animation: "spin 25s linear infinite",
                        }}
                      ></div>

                      {/* Central content */}
                      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
                        {/* Main brain/learning icon */}
                        <div className="relative group">
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 flex items-center justify-center shadow-2xl backdrop-blur-sm border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                            <Brain className="w-16 h-16 text-primary drop-shadow-lg" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          {/* Pulsing ring */}
                          <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping"></div>
                        </div>

                        {/* Surrounding learning elements */}
                        <div className="flex space-x-12">
                          <div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-xl backdrop-blur-sm border border-primary/30 hover:scale-110 transition-all duration-300 cursor-pointer group"
                            style={{
                              animation: "float 3s ease-in-out infinite",
                              animationDelay: "0s",
                            }}
                          >
                            <BookOpen className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shadow-xl backdrop-blur-sm border border-accent/30 hover:scale-110 transition-all duration-300 cursor-pointer group"
                            style={{
                              animation: "float 3s ease-in-out infinite",
                              animationDelay: "1s",
                            }}
                          >
                            <Target className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                          </div>
                          <div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center shadow-xl backdrop-blur-sm border border-secondary/30 hover:scale-110 transition-all duration-300 cursor-pointer group"
                            style={{
                              animation: "float 3s ease-in-out infinite",
                              animationDelay: "2s",
                            }}
                          >
                            <Zap className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform" />
                          </div>
                        </div>

                        {/* Enhanced text labels */}
                        <div className="text-center space-y-2">
                          <div className="text-primary font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            AI-Powered
                          </div>
                          <div className="text-text/70 text-base font-medium">
                            Learning Cards
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced floating decorative elements */}
                    <div
                      className="absolute -top-4 -right-8 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full opacity-80 shadow-lg"
                      style={{
                        animation: "float 4s ease-in-out infinite",
                        animationDelay: "0s",
                      }}
                    ></div>
                    <div
                      className="absolute -bottom-12 -left-12 w-10 h-10 bg-gradient-to-r from-accent to-secondary rounded-full opacity-80 shadow-lg"
                      style={{
                        animation: "float 4s ease-in-out infinite",
                        animationDelay: "2s",
                      }}
                    ></div>
                    <div
                      className="absolute top-1/4 -left-16 w-8 h-8 bg-gradient-to-r from-secondary to-primary rounded-full opacity-70 shadow-lg"
                      style={{
                        animation: "float 4s ease-in-out infinite",
                        animationDelay: "3s",
                      }}
                    ></div>
                    <div
                      className="absolute top-3/4 -right-12 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60 shadow-lg"
                      style={{
                        animation: "float 4s ease-in-out infinite",
                        animationDelay: "1s",
                      }}
                    ></div>

                    {/* Additional sparkle effects */}
                    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></div>
                    <div
                      className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping opacity-75"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                      className="absolute top-2/3 right-1/3 w-2 h-2 bg-secondary rounded-full animate-ping opacity-75"
                      style={{ animationDelay: "2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </HeroHighlight>
          {/* Features Section */}
          <section className="py-24 bg-gradient-to-b from-background to-background/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h3 className="text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Why Choose MindSnap?
                  </span>
                </h3>
                <p className="text-xl text-text/70 max-w-3xl mx-auto">
                  Experience the future of learning with our cutting-edge features designed to maximize your potential
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group p-8 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-text">{feature.title}</h4>
                    <p className="text-text/70 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-sm border-t border-primary/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
              <div className="grid md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      MindSnap
                    </span>
                  </div>
                  <p className="text-text/70 max-w-sm">
                    Revolutionizing learning through AI-powered flashcards and adaptive learning techniques.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-pointer transition-colors">
                      <Twitter className="w-5 h-5 text-primary" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-pointer transition-colors">
                      <Github className="w-5 h-5 text-primary" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-pointer transition-colors">
                      <Linkedin className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Product */}
                <div>
                  <h5 className="font-semibold text-text mb-4">Product</h5>
                  <ul className="space-y-2 text-text/70">
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        API
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Integrations
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h5 className="font-semibold text-text mb-4">Company</h5>
                  <ul className="space-y-2 text-text/70">
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h5 className="font-semibold text-text mb-4">Support</h5>
                  <ul className="space-y-2 text-text/70">
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Community
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-primary/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-text/60 text-sm">© 2024 MindSnap. All rights reserved.</p>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className="text-text/60 text-sm">Made with</span>
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-text/60 text-sm">for learners worldwide</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      ) : null}
    </div>
  );
}
