import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle2, AlertCircle, PhoneCall, User, Mail, Phone, MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

const PRESET_SCENARIOS = [
  { id: 'staffing',    label: 'Staffing Service',
    text: 'Staffing and recruitment agency. Call the prospect to understand their hiring needs — open roles, headcount, timeline, locations. Briefly mention our candidate-pool size and turnaround. Ask if a 15-minute call with an account manager works this week.' },
  { id: 'fitness',     label: 'Fitness',
    text: 'Fitness studio / gym chain. Confirm interest in a fitness membership. Ask about fitness goals (weight loss, strength, general health), preferred location and timing. If the prospect hesitates on price, offer a free trial class. Capture preferred call-back time for a tour.' },
  { id: 'real-estate', label: 'Real Estate',
    text: 'Real estate consultancy. Prospect enquired about properties recently. Verify budget range, preferred locality, BHK configuration, and intent (investment vs end-use). Offer to schedule a site visit. Capture WhatsApp number for sending a curated property list.' },
  { id: 'maintenance', label: 'Maintenance',
    text: 'Building / property maintenance service. Call existing or prospective customer to schedule routine servicing (AC, plumbing, electrical, deep-clean). Confirm address and preferred date/time slot. Offer an annual maintenance contract with discount if appropriate.' },
  { id: 'healthcare',  label: 'Healthcare',
    text: 'Clinic / diagnostic centre follow-up. Patient booked an appointment or test. Confirm the date, time and pre-test instructions (fasting, hydration, paperwork). Answer any questions politely and offer to reschedule if the slot does not work.' },
  { id: 'edtech',      label: 'EdTech',
    text: 'Online education / coaching platform. Lead filled an enquiry form for a course. Confirm which course they are interested in, their goal (skill-up, exam prep, career change), and current background. Pitch the next cohort start date and offer a free trial class.' },
]

/**
 * DemoCallForm — body-only form (no outer page chrome). Reused by:
 *   - DemoCallModal (dialog popup on landing)
 *   - /demo route page (DemoForm wraps this in a centered section)
 *
 * Props:
 *   onSuccess(data) — optional callback after successful POST /demo_call
 */
export default function DemoCallForm({ onSuccess } = {}) {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [scenario,  setScenario]  = useState(PRESET_SCENARIOS[0].text)
  const [remaining, setRemaining] = useState(null)
  const [pending,   setPending]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setPending(true); setError(null); setSuccess(false)
    try {
      const data = await apiFetch('/demo_call', {
        method: 'POST', skipAuth: true,
        body: {
          name:         name.trim(),
          email:        email.trim(),
          phone_number: phone.trim(),
          scenario:     scenario.trim(),
        },
      })
      if (typeof data.demo_remaining === 'number') setRemaining(data.demo_remaining)
      setSuccess(true)
      onSuccess?.(data)
    } catch (err) {
      setError(err)
    } finally {
      setPending(false)
    }
  }

  const errMsg = error?.body?.detail || error?.body?.error || error?.message

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <CheckCircle2 className="size-12 mx-auto mb-4 text-emerald-500" />
        <h3 className="font-display text-2xl font-semibold">Call dialed!</h3>
        <p className="mt-2 text-base text-[var(--color-fg-muted)]">
          Your phone should ring in seconds. Pick up and talk to Rahul.
        </p>
        {typeof remaining === 'number' && (
          <p className="mt-2 text-xs text-[var(--color-fg-subtle)]">
            {remaining} demo {remaining === 1 ? 'call' : 'calls'} remaining for this email in the next 24h.
          </p>
        )}
        <Button variant="outline" size="default" className="mt-6" onClick={() => { setSuccess(false); setError(null) }}>
          Place another
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dm-name" >Your name</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="dm-name" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dm-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="dm-email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dm-phone">Phone number (with country code)</Label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
          <Input id="dm-phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required className="pl-10" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pick a preset</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.text)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                scenario === s.text
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border-strong)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dm-scenario">Scenario / brief</Label>
        <div className="relative">
          <MessageSquare className="absolute left-3.5 top-3.5 size-4 text-[var(--color-fg-subtle)]" />
          <Textarea id="dm-scenario" value={scenario} onChange={e => setScenario(e.target.value)} required className="pl-10 min-h-[110px]" />
        </div>
        <p className="text-sm text-[var(--color-fg-subtle)]">
          Describe what the agent should do on the call.
        </p>
      </div>

      {errMsg && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{String(errMsg)}</span>
        </motion.div>
      )}

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
        {pending
          ? <><Loader2 className="size-4 animate-spin" /> Dialing…</>
          : <><PhoneCall className="size-4" /> Place Call</>
        }
      </Button>

      
    </form>
  )
}
