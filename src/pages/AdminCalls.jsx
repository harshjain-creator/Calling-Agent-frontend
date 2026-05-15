import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Search, Phone, Clock, RefreshCw, Loader,
  Users, BarChart3, ChevronRight, X,
} from 'lucide-react'
import { API_BASE } from '../config'
import OutcomeBadge from '../components/OutcomeBadge'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}
function fmtDur(s) {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}m ${sec}s`
}
function relTime(iso) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  const diff = (Date.now() - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

const OUTCOME_FILTERS = [
  'interested', 'callback_requested', 'meeting_scheduled',
  'information_shared', 'not_interested', 'unclear', 'call_dropped',
]

export default function AdminCalls() {
  const navigate = useNavigate()
  const [calls, setCalls]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [err, setErr]       = useState(null)
  const [q, setQ]           = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState(null)

  const load = async () => {
    setLoad(true); setErr(null)
    try {
      const r = await fetch(`${API_BASE}/admin/calls`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setCalls(Array.isArray(data) ? data : [])
    } catch (e) {
      setErr(e.message || 'Failed to load calls')
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const total = calls.length
    const uniqUsers = new Set(calls.map(c => c.user_id).filter(Boolean)).size
    const durations = calls.map(c => c.duration_s).filter(v => v != null)
    const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const interested = calls.filter(c => c.summary_json?.outcome === 'interested').length
    return { total, uniqUsers, avgDur, interested }
  }, [calls])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return calls.filter(c => {
      if (outcomeFilter && c.summary_json?.outcome !== outcomeFilter) return false
      if (!t) return true
      const u = c.users || {}
      return (
        (u.name  || '').toLowerCase().includes(t) ||
        (u.email || '').toLowerCase().includes(t) ||
        (u.phone || '').toLowerCase().includes(t) ||
        (c.scenario || '').toLowerCase().includes(t) ||
        (c.summary  || '').toLowerCase().includes(t) ||
        (c.call_sid || '').toLowerCase().includes(t)
      )
    })
  }, [calls, q, outcomeFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden font-sans">
      {/* Ambient blobs */}
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-blue-500/20 blur-3xl animate-blob-slow pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-purple-500/15 blur-3xl animate-blob pointer-events-none" />

      <div className="relative">
        <div className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white transition w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin · Calls</h1>
              <p className="text-xs text-gray-400 mt-0.5">All call recordings, transcripts & AI summaries</p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <StatCard icon={Phone}    label="Total Calls"      value={stats.total}                    accent="from-pink-500/30 to-pink-500/10" />
            <StatCard icon={Users}    label="Unique Customers" value={stats.uniqUsers}                accent="from-blue-500/30 to-blue-500/10" />
            <StatCard icon={Clock}    label="Avg Duration"     value={fmtDur(stats.avgDur)}           accent="from-purple-500/30 to-purple-500/10" />
            <StatCard icon={BarChart3} label="Interested"      value={stats.interested}               accent="from-emerald-500/30 to-emerald-500/10" />
          </div>

          {/* Search */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search name, email, phone, scenario, summary, or SID..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
            {q && (
              <button onClick={() => setQ('')} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-sm text-gray-400 whitespace-nowrap">{filtered.length} / {calls.length}</span>
          </div>

          {/* Outcome filter chips */}
          <div className="flex flex-wrap gap-2 animate-fade-in">
            <button
              onClick={() => setOutcomeFilter(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                outcomeFilter === null
                  ? 'bg-white/20 text-white border-white/40'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {OUTCOME_FILTERS.map(o => (
              <button
                key={o}
                onClick={() => setOutcomeFilter(outcomeFilter === o ? null : o)}
                className={`text-xs px-3 py-1.5 rounded-full border transition capitalize ${
                  outcomeFilter === o
                    ? 'bg-white/20 text-white border-white/40'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {o.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* List */}
          {loading && (
            <div className="flex items-center justify-center py-20 text-gray-300">
              <Loader className="w-6 h-6 animate-spin mr-3" /> Loading calls...
            </div>
          )}
          {err && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300">
              Error: {err}
            </div>
          )}
          {!loading && !err && filtered.length === 0 && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-16 text-center">
              <Phone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-1">No calls match your filters</p>
              <p className="text-gray-500 text-sm">Try clearing search or outcome filter.</p>
            </div>
          )}
          {!loading && !err && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((c, i) => {
                const u = c.users || {}
                const js = c.summary_json || {}
                return (
                  <Link
                    key={c.id}
                    to={`/admin/calls/${c.id}`}
                    style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                    className="group block bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-pink-400/50 rounded-xl p-5 transition-all hover:translate-x-1 animate-fade-in"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/40 to-blue-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-white font-semibold">{u.name || 'Unknown'}</span>
                          <span className="text-gray-500 text-xs">·</span>
                          <span className="text-gray-400 text-sm truncate">{u.email}</span>
                          <span className="text-gray-500 text-xs">·</span>
                          <span className="text-gray-400 text-sm">{u.phone}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-1">{c.scenario || '—'}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {relTime(c.started_at)}</span>
                          <span>·</span>
                          <span>{fmtDur(c.duration_s)}</span>
                          <span>·</span>
                          <span className="uppercase">{c.language_initial || '—'}</span>
                          {c.audio_mode && <><span>·</span><span>{c.audio_mode}</span></>}
                          {c.recording_url && <><span>·</span><span className="text-emerald-400">recording</span></>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {js.outcome && <OutcomeBadge value={js.outcome} kind="outcome" />}
                        {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5`}>
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${accent} blur-2xl`} />
      <div className="relative">
        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}
