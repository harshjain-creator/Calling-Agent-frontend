import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Phone, User as UserIcon, Calendar, Hash } from 'lucide-react'

import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AudioPlayer    from '@/components/AudioPlayer'
import TranscriptView from '@/components/TranscriptView'
import SummaryCard    from '@/components/SummaryCard'
import MetricsBar     from '@/components/MetricsBar'
import OutcomeBadge   from '@/components/OutcomeBadge'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function AdminCallDetail() {
  const { id } = useParams()
  const [data, setData]   = useState(null)
  const [err,  setErr]    = useState(null)
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    let active = true
    setLoad(true); setErr(null)
    apiFetch(`/admin/calls/${id}`)
      .then(d => { if (active) setData(d) })
      .catch(e => { if (active) setErr(e.status === 404 ? 'Call not found' : (e.body?.detail || e.message || 'Failed')) })
      .finally(() => { if (active) setLoad(false) })
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 py-24 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[var(--color-fg-muted)]" />
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className="w-full px-4 sm:px-6 py-8 space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/calls"><ArrowLeft className="size-4" /> Back to calls</Link>
        </Button>
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-6 text-red-500 text-sm">{err || 'No data'}</CardContent>
        </Card>
      </div>
    )
  }

  const { call, turns } = data
  const u  = call.users || {}
  const js = call.summary_json || {}

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="mt-0.5">
            <Link to="/admin/calls"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Calendar className="size-5 text-[var(--color-accent)]" />
              {fmtDate(call.started_at)}
            </h1>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1 flex items-center gap-1 truncate">
              <Hash className="size-3" />
              {call.call_sid || call.id}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
        </div>
      </div>

      {/* Customer card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3">Customer</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <InfoItem icon={UserIcon} label="Name"  value={u.name  || '—'} />
            <InfoItem icon={Mail}     label="Email" value={u.email || '—'} />
            <InfoItem icon={Phone}    label="Phone" value={u.phone || '—'} />
          </div>
        </CardContent>
      </Card>

      {/* Scenario */}
      {call.scenario && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-2">Scenario</h3>
            <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">{call.scenario}</p>
          </CardContent>
        </Card>
      )}

      <AudioPlayer src={call.recording_url} />
      <MetricsBar call={call} />

      <div className="grid md:grid-cols-2 gap-6">
        <SummaryCard summary={call.summary} summaryJson={call.summary_json} />
        <TranscriptView turns={turns} />
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">{label}</p>
        <p className="text-[var(--color-fg)] text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
