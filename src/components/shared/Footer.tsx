import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Built by{' '}
            <span className="font-semibold text-foreground">Pritam Wankhede</span>
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/PritamWankhede"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub Profile"
            >
              <ExternalLink className="h-4 w-4" />
              <span>GitHub</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/pritamwankhede/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="LinkedIn Profile"
            >
              <ExternalLink className="h-4 w-4" />
              <span>LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
