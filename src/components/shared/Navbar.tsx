'use client'

import { Brain, LogOut, Menu, Settings, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/practice', label: 'Practice' },
  { href: '/sessions', label: 'History' },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const initials =
    session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
          <Brain className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">InterviewPrep AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname === link.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* User Menu */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user.name && (
                      <p className="font-medium">{session.user.name}</p>
                    )}
                    {session.user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href="/profile"
                    className="flex w-full items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {session.user.role === 'ADMIN' && (
                  <DropdownMenuItem>
                    <Link
                      href="/admin/questions"
                      className="flex w-full items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                      pathname === link.href ? 'bg-accent' : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
