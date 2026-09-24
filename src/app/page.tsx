import {
  ArrowRight,
  Brain,
  CheckCircle,
  Flame,
  MessageSquare,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Footer } from '@/components/shared/Footer'

const features = [
  {
    icon: Brain,
    title: 'AI Interview Coach',
    description:
      'Powered by Groq GPT OSS 20B. Get instant, detailed feedback on clarity, depth, and technical accuracy.',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  },
  {
    icon: Sparkles,
    title: 'Personalized Study Plan',
    description:
      '7-day AI-generated roadmap based on your weak areas. Adapts as you improve.',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    icon: Trophy,
    title: 'Progress Tracking',
    description:
      'Track scores across 6 categories. Visual charts, streaks, and session history.',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    icon: Zap,
    title: 'Redis-Powered Speed',
    description:
      'Intelligent caching means instant question loads and zero repeated AI calls.',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    icon: MessageSquare,
    title: '18+ Curated Questions',
    description:
      'DSA, System Design, Behavioral, Frontend, Backend, Database — all levels.',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  },
  {
    icon: Flame,
    title: 'Streak System',
    description:
      'Build daily practice habits. Track your streak and stay consistent.',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
]

const stats = [
  { value: '18+', label: 'Practice Questions' },
  { value: '6', label: 'Categories' },
  { value: 'AI', label: 'Powered Feedback' },
  { value: '∞', label: 'Growth Potential' },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Brain className="h-6 w-6 text-primary" />
            InterviewPrep AI
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Groq · GPT OSS 20B
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Ace your next{' '}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
                tech interview
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Practice real interview questions, get instant AI feedback on every answer,
              and follow a personalized study plan — all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8 shadow-md">
                  <Sparkles className="h-4 w-4" />
                  Start practicing free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              {['No credit card required', 'Free to use', 'AI feedback on every answer'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y bg-muted/30 py-10">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to land the job
              </h2>
              <p className="mt-3 text-muted-foreground">
                Built with Next.js 16, PostgreSQL, Redis, and cutting-edge AI
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className={`mb-4 inline-flex rounded-xl p-2.5 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-pink-500/10 border border-primary/20 p-10 sm:p-14">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to level up?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Join and start getting AI feedback on your answers today.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-10 shadow-md">
                    <Brain className="h-4 w-4" />
                    Get started for free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
