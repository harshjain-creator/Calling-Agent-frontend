export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8002').replace(/\/+$/, '')

export const COMPANY = {
  name: 'Fristine Infotech',
  tagline: 'Voice AI for the next generation of enterprise.',
  contactEmail: 'hello@fristineinfotech.com',
}

// Public site nav (anonymous visitors)
export const NAV_LINKS = [
  { label: 'Pricing', to: '/pricing' },
]

// Client admin nav — visible after login when role=client_admin
export const CLIENT_NAV_LINKS = [
  { label: 'Dashboard',     to: '/dashboard' },
  { label: 'Calls History', to: '/admin/calls' },
  { label: 'Call',          to: '/call' },          // Single + Bulk in one tab
  { label: 'Add Scenario',  to: '/admin/scenarios' },
]

// Super admin nav — Fristine internal
export const SUPER_NAV_LINKS = [
  { label: 'Dashboard',  to: '/superadmin' },
  { label: 'All Calls',  to: '/admin/calls' },
  { label: 'Call',       to: '/call' },             // Single + Bulk in one tab
  { label: 'Scenarios',  to: '/admin/scenarios' },
  { label: 'Plans',      to: '/superadmin/plans' },
  { label: 'Users',      to: '/superadmin/users' },
  { label: 'Cost Rates', to: '/superadmin/cost_rates' },
]

