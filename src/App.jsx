import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout       from '@/components/PublicLayout'
import RequireAuth        from '@/components/RequireAuth'
import RedirectIfAuthed   from '@/components/RedirectIfAuthed'

import LandingPage  from '@/pages/LandingPage'
import About        from '@/pages/About'
import Services     from '@/pages/Services'
import Pricing      from '@/pages/Pricing'
import Contact      from '@/pages/Contact'
import DemoForm     from '@/pages/DemoForm'

import AdminCalls       from '@/pages/AdminCalls'
import AdminCallDetail  from '@/pages/AdminCallDetail'
import BulkCall         from '@/pages/BulkCall'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Marketing routes — anonymous only. Authed users redirect to dashboard. */}
          <Route element={<RedirectIfAuthed />}>
            <Route path="/"           element={<LandingPage />} />
            <Route path="/about"      element={<About />} />
            <Route path="/services"   element={<Services />} />
            <Route path="/pricing"    element={<Pricing />} />
            <Route path="/contact"    element={<Contact />} />
            <Route path="/demo"       element={<DemoForm />} />
          </Route>

          {/* Client-admin scoped — bulk + own org calls */}
          <Route element={<RequireAuth roles={['client_admin', 'super_admin']} />}>
            <Route path="/dashboard"        element={<Navigate to="/admin/calls" replace />} />
            <Route path="/bulk"             element={<BulkCall />} />
            <Route path="/admin/calls"      element={<AdminCalls />} />
            <Route path="/admin/calls/:id"  element={<AdminCallDetail />} />
          </Route>

          {/* Super-admin only — stub landing (full superadmin UI is follow-up) */}
          <Route element={<RequireAuth roles={['super_admin']} />}>
            <Route path="/superadmin" element={<Navigate to="/admin/calls" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
