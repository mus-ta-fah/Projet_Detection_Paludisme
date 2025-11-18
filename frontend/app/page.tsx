'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Microscope, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';
// import { ModelComparison } from '@/components/features/prediction/ModelComparaison';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Microscope className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Malaria Detection</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            🔬 Powered by Deep Learning
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Detect Malaria with
            <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {' '}AI Precision
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Advanced deep learning platform for rapid and accurate malaria detection 
            from blood cell images. Achieve 95.89% accuracy in seconds.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>95.89% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>&lt;1s Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>3 AI Models</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Microscope className="h-10 w-10" />}
            title="Advanced CNN Models"
            description="Three state-of-the-art convolutional neural networks working in ensemble for maximum accuracy."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10" />}
            title="Real-time Analysis"
            description="Get results in less than a second with our optimized inference pipeline."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10" />}
            title="Medical Grade"
            description="Trained on 27,000+ verified blood cell images for reliable diagnostics."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10" />}
            title="Detailed Statistics"
            description="Track predictions, trends, and performance metrics over time."
          />
          <FeatureCard
            icon={<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>}
            title="PDF Export"
            description="Generate professional reports with results and recommendations."
          />
          <FeatureCard
            icon={<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>}
            title="Multi-user Support"
            description="Collaborate with your team and manage patient records securely."
          />
        </div>
      </section>

      {/* <ModelComparison/> */}
      {/* <BatchUploader/> */}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl bg-linear-to-r from-primary to-purple-600 p-12 text-center text-white">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Join hundreds of medical professionals using AI to improve malaria diagnosis.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Malaria Detection Platform. Master 1 DSGL - UADB</p>
          <p className="mt-2">Built with Next.js, FastAPI, and TensorFlow</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}