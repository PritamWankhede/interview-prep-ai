import { Brain, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const highlights = [
  'AI feedback on every answer',
  'Personalized 7-day study plan',
  'Track progress across 6 categories',
  'Rate-limited, secure & fast',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 font-bold text-xl">
          <div className="rounded-xl bg-primary/20 p-2">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          InterviewPrep AI
        </Link>

        {/* Middle content */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Powered by Groq · GPT OSS 20B
            </div>
            <h2 className="text-3xl font-bold leading-snug">
              Practice smarter,<br />land your dream role.
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Real interview questions with instant AI coaching. Get the feedback
              senior engineers wish they had when they were starting out.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Quote */}
        <blockquote className="relative space-y-1 border-l border-white/20 pl-4">
          <p className="text-sm text-zinc-400 italic leading-relaxed">
            &ldquo;The more you practice, the luckier you get.&rdquo;
          </p>
          <footer className="text-xs text-zinc-600">— Gary Player</footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center bg-background p-6 sm:p-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-lg lg:hidden">
          <Brain className="h-5 w-5 text-primary" />
          InterviewPrep AI
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
