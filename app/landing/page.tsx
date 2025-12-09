
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sparkles,
  Users,
  Zap,
  Globe,
  MessageCircle,
  TrendingUp,
  Shield,
  Layers,
  Heart,
  Rocket,
  Star,
  ChevronRight,
  Play,
  Check,
  ArrowRight,
  Gamepad2,
  Hash,
  AtSign,
  Trophy,
  Bell,
  Flame,
  Radio,
  Video,
  Mic,
  Download,
  Smartphone,
} from "lucide-react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 20,
          y: (e.clientY - rect.top - rect.height / 2) / 20,
        })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Layers,
      title: "Fusion Posts",
      description: "Revolutionary collaborative posts where multiple creators can layer content together in real-time",
      gradient: "from-purple-500 to-pink-500",
      details: [
        "Multi-layer content creation",
        "Real-time collaboration",
        "Mix text, images, videos, polls",
        "Unlimited creative freedom",
      ],
    },
    {
      icon: Gamepad2,
      title: "Ripple Rooms",
      description: "24-hour temporary gaming rooms with live streaming, voice chat, and match tracking",
      gradient: "from-blue-500 to-cyan-500",
      details: [
        "Gaming lobbies & matchmaking",
        "Live stream integration",
        "Voice & video chat",
        "Match highlights & clips",
      ],
    },
    {
      icon: Users,
      title: "P!!E Communities",
      description: "Create and join vibrant communities with threads, events, audio rooms, and rich discussions",
      gradient: "from-green-500 to-emerald-500",
      details: [
        "Threaded discussions",
        "Community events",
        "Audio rooms & voice chat",
        "Custom roles & badges",
      ],
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Lightning-fast messaging with reactions, media sharing, and rich content support",
      gradient: "from-orange-500 to-red-500",
      details: [
        "Instant messaging",
        "Message reactions",
        "Media attachments",
        "Voice messages",
      ],
    },
  ]

  const stats = [
    { value: "100%", label: "Free Forever" },
    { value: "Unlimited", label: "Posts & Rooms" },
    { value: "24/7", label: "Active Communities" },
    { value: "∞", label: "Possibilities" },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "/placeholder.svg?height=60&width=60",
      text: "Fusion Posts changed how I collaborate! Creating layered content with my team has never been this seamless.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Pro Gamer",
      avatar: "/placeholder.svg?height=60&width=60",
      text: "Ripple Rooms are perfect for organizing matches. The 24-hour format keeps things fresh and exciting!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Community Leader",
      avatar: "/placeholder.svg?height=60&width=60",
      text: "P!!E Communities gave me all the tools I need to build and manage an engaged community!",
      rating: 5,
    },
  ]

  const uniqueFeatures = [
    {
      icon: Hash,
      title: "Smart Hashtags",
      description: "Discover trending topics and connect with relevant conversations instantly",
    },
    {
      icon: AtSign,
      title: "@ Mentions",
      description: "Tag users seamlessly and build meaningful connections across the platform",
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Earn badges, achievements, and climb ranks as you engage with the community",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay updated with intelligent notifications that matter to you",
    },
    {
      icon: Flame,
      title: "Trending System",
      description: "Real-time trending posts, topics, and creators based on engagement",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Advanced moderation tools and reporting system to keep communities safe",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Play Store Coming Soon Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-3 px-4 text-center animate-pulse">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Smartphone className="w-5 h-5" />
          <span className="font-bold">Coming Soon to Google Play Store!</span>
          <Download className="w-5 h-5" />
          <span className="text-sm opacity-90">Download the app soon</span>
        </div>
      </div>

      {/* Hero Section with 3D Effects */}
      <section ref={heroRef} className="relative overflow-hidden pt-16">
        {/* Animated 3D Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-float"
                style={{
                  width: `${Math.random() * 300 + 100}px`,
                  height: `${Math.random() * 300 + 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div 
            className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`,
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm shadow-lg hover:shadow-primary/20 transition-all">
              <Sparkles className="text-primary animate-spin-slow" size={16} />
              <span className="text-sm font-semibold text-primary">100% Free • No Limits • No Ads</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                P!!e
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The all-in-one social platform where creators collaborate, gamers connect, and communities thrive. 
              <span className="block mt-2 font-semibold text-foreground">
                Completely free. Forever.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:shadow-primary/50 neon-glow group">
                  Start Creating Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 group">
                <Play className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                Watch Demo
              </Button>
            </div>

            {/* Floating 3D Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
              {features.slice(0, 3).map((feature, index) => (
                <Card
                  key={index}
                  className={`p-6 border-2 transition-all duration-500 cursor-pointer group ${
                    activeFeature === index ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/50'
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateX(${activeFeature === index ? -5 : 0}deg) translateY(${activeFeature === index ? -10 : 0}px)`,
                    transition: 'all 0.5s ease-out',
                  }}
                >
                  <div 
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                    style={{
                      transform: `translateZ(20px)`,
                    }}
                  >
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              P!!e combines the best features of social platforms into one seamless experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 border-2 border-border/50 hover:border-primary/50 transition-all group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, dIndex) => (
                    <li key={dIndex} className="flex items-center gap-2 text-sm">
                      <Check className="text-primary flex-shrink-0" size={16} />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose P!!e?</h2>
            <p className="text-xl text-muted-foreground">Features that set us apart</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {uniqueFeatures.map((feature, index) => (
              <Card key={index} className="p-6 border-2 border-border/50 hover:border-primary/50 transition-all text-center group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-xl text-muted-foreground">See what our community has to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-2 border-border/50 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-500 fill-yellow-500" size={16} />
                  ))}
                </div>
                <p className="text-muted-foreground italic">&ldquo;{testimonial.text}&rdquo;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Rocket className="mx-auto mb-6 text-primary" size={64} />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join P!!e?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators, gamers, and community builders on the platform that's completely free, forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl">
                Create Free Account
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Explore Features
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • No hidden fees • No limits
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-primary" size={24} />
                <span className="font-bold text-xl">P!!e</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The free social platform for creators, gamers, and communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                <li><Link href="/explore" className="hover:text-primary">Explore</Link></li>
                <li><Link href="/communities" className="hover:text-primary">Communities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 P!!e. All rights reserved. Always free, always yours.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
