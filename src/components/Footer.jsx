import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail } from 'lucide-react'
import { COMPANY } from '@/config'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--color-border)] glass">
      <div className="w-full px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center" aria-label={COMPANY.name}>
            <img src="/fristinelogo.png" alt={COMPANY.name} className="h-10 w-auto object-contain" />
          </Link>
          <p className="mt-4 max-w-md text-sm text-[var(--color-fg-muted)] leading-relaxed">
            {COMPANY.tagline}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 text-[var(--color-fg)]">Connect</h4>
          <div className="flex items-center gap-3">
            <a href={`mailto:${COMPANY.contactEmail}`} aria-label="Email"
               className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
              <Mail className="size-4" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"
               className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
              <Linkedin className="size-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"
               className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
              <Github className="size-4" />
            </a>
          </div>
          <p className="mt-3 text-xs text-[var(--color-fg-subtle)]">{COMPANY.contactEmail}</p>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] py-5 text-center text-xs text-[var(--color-fg-subtle)]">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  )
}
