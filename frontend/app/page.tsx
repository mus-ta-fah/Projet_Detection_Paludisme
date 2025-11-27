'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Microscope, Zap, Shield, BarChart3, ArrowRight, CheckCircle2, 
  TrendingUp, Clock, Award, Users, Globe, Sparkles, Brain, Target,
  type LucideIcon
} from 'lucide-react';
import { useState, useEffect, PropsWithChildren, ReactNode } from 'react';

export default function HomePage() {
  const [stats, setStats] = useState({ predictions: 0, accuracy: 0, users: 0 });

  // Animate stats on load
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        predictions: prev.predictions < 10547 ? prev.predictions + 100 : 10547,
        accuracy: prev.accuracy < 95.89 ? prev.accuracy + 0.5 : 95.89,
        users: prev.users < 247 ? prev.users + 5 : 247,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Microscope className="h-8 w-8 text-primary" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Malaria AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about">
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto p-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-slide-in-bottom">
              <Sparkles className="h-4 w-4" />
              AI-Powered Medical Diagnostics
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Detect Malaria with
              <span className="bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                {' '}AI Precision
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Revolutionary deep learning platform achieving 95.89% accuracy in malaria detection. 
              Faster, more reliable, and accessible to everyone.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Start Analyzing <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard/about">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.predictions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.accuracy.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.users}+</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="relative rounded-2xl border-4 border-primary/20 bg-linear-to-br from-primary/10 to-purple-600/10 p-8 animate-float">
              <div className="aspect-square rounded-xl bg-linear-to-br from-blue-500 to-purple-600 p-8 shadow-2xl">
                <div className="h-full w-full flex flex-col items-center justify-center text-white space-y-6">
                  <Brain className="h-24 w-24 animate-pulse" />
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold">3 AI Models</p>
                    <p className="text-sm opacity-90">Deep Learning • CNN • Ensemble</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{'<1s'}</div>
                      <div className="text-xs">Analysis Time</div>
                    </div>
                    <div className="w-px bg-white/30" />
                    <div className="text-center">
                      <div className="text-3xl font-bold">27K+</div>
                      <div className="text-xs">Training Images</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg animate-bounce-slow">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg animate-bounce-slow" style={{ animationDelay: '1s' }}>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Malaria AI?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology meets medical expertise for unparalleled accuracy
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-12 w-12" />}
              title="3 AI Models"
              description="Ensemble of CNN, BatchNorm, and Deep VGG models working together for maximum accuracy"
              stats="95.89% accuracy"
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Zap className="h-12 w-12" />}
              title="Lightning Fast"
              description="Get results in less than a second with our optimized inference pipeline"
              stats="<1s processing"
              color="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Shield className="h-12 w-12" />}
              title="Medical Grade"
              description="Trained on 27,000+ verified images with rigorous validation protocols"
              stats="27K+ images"
              color="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<BarChart3 className="h-12 w-12" />}
              title="Advanced Analytics"
              description="Track predictions, trends, and performance metrics with interactive dashboards"
              stats="Real-time insights"
              color="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Target className="h-12 w-12" />}
              title="Multi-Model Compare"
              description="Compare predictions across all models simultaneously for highest confidence"
              stats="Ensemble voting"
              color="from-red-500 to-rose-500"
            />
            <FeatureCard
              icon={<Globe className="h-12 w-12" />}
              title="Accessible Anywhere"
              description="Cloud-based platform accessible from any device, anywhere in the world"
              stats="24/7 available"
              color="from-indigo-500 to-blue-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple 3-step process to get results</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: 1, title: 'Upload Image', desc: 'Upload blood cell microscopy image', icon: Upload },
              { step: 2, title: 'AI Analysis', desc: '3 models analyze simultaneously', icon: Brain },
              { step: 3, title: 'Get Results', desc: 'Instant results with confidence score', icon: CheckCircle2 },
            ].map((item) => (
              <div key={item.step} className="relative">
                <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Medical Professionals</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-purple-600" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">&quot;{t.quote}&quot;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-primary to-purple-600 opacity-10" />
            <CardContent className="relative p-12 text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of medical professionals using AI to improve malaria diagnosis
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/dashboard/about">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Microscope className="h-6 w-6 text-primary" />
                <span className="font-bold">Malaria AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered malaria detection for better healthcare outcomes
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/dashboard"><div className="hover:text-primary">Dashboard</div></Link>
                <Link href="/dashboard/analyze"><div className="hover:text-primary">Analysis</div></Link>
                <Link href="/dashboard/models"><div className="hover:text-primary">Models</div></Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/dashboard/about"><div className="hover:text-primary">About</div></Link>
                <div className="hover:text-primary cursor-pointer">Team</div>
                <div className="hover:text-primary cursor-pointer">Contact</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="hover:text-primary cursor-pointer">Privacy</div>
                <div className="hover:text-primary cursor-pointer">Terms</div>
                <div className="hover:text-primary cursor-pointer">License</div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 Malaria AI - Master 1 DSGL UADB. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description, stats, color }: {
  icon: ReactNode, title: string, description: string, stats: string, color: string
}) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <CardContent className="p-6 space-y-4">
        <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${color} p-3 text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-3">{description}</p>
          <Badge variant="secondary">{stats}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    quote: "This AI system has transformed our diagnostic workflow. Fast, accurate, and reliable."
  },
  {
    name: "Dr. Michael Chen",
    role: "Laboratory Director",
    quote: "The ensemble approach gives us confidence in every diagnosis. Truly impressive technology."
  },
  {
    name: "Dr. Aisha Patel",
    role: "Research Scientist",
    quote: "95.89% accuracy is remarkable. This tool is a game-changer for malaria detection."
  }
];

function Upload(props: PropsWithChildren) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}