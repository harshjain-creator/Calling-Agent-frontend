import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, LayoutDashboard, User2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import LoginModal from '@/components/LoginModal'
import { useAuth } from '@/contexts/AuthContext'
import { COMPANY, NAV_LINKS } from '@/config'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-[var(--color-accent)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

/**
 * Minimal header — logo only on the left, theme toggle + login/dashboard on
 * the right. No nav menu (removed by request). Mobile + desktop identical.
 */
export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false)
  const { isAuthed, role, user, logout } = useAuth()
  const navigate = useNavigate()

  const dashHref = role === 'super_admin' ? '/superadmin' : '/dashboard'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 glass border-b border-[var(--color-border)]">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="group inline-flex items-center" aria-label={COMPANY.name}>
            <img
              src="/fristinelogo.png"
              alt={COMPANY.name}
              className="h-10 w-auto object-contain group-hover:scale-[1.04] transition-transform"
            />
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => <NavItem key={l.to} to={l.to}>{l.label}</NavItem>)}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthed ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={dashHref}>
                    <LayoutDashboard className="size-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
                <span className="hidden lg:flex items-center gap-1.5 px-2 text-xs text-[var(--color-fg-muted)]">
                  <User2 className="size-3.5" />
                  {user?.email}
                </span>
              </>
            ) : (
              <Button variant="gradient" size="sm" onClick={() => setLoginOpen(true)}>
                <LogIn className="size-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
