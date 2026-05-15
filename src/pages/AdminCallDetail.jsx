import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader, Mail, Phone, User as UserIcon, Calendar, Hash } from 'lucide-react'
import { API_BASE } from '../config'
import AudioPlayer from '../components/AudioPlayer'
import TranscriptView from '../components/TranscriptView'
import SummaryCard from '../components/SummaryCard'
import MetricsBar from '../components/MetricsBar'
import OutcomeBadge from '../components/OutcomeBadge'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function AdminCallDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [err, setErr]   = useState(null)
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    let active = true
    setLoad(true); setErr(null)
    fetch(`${API_BASE}/admin/calls/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Call not found' : `HTTP ${r.status}`)
        return r.json()
      })
      .then(d => { if (active) setData(d) })
      .catch(e => { if (active) setErr(e.message) })
      .finally(() => { if (active) setLoad(false) })
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center font-sans">
        <Loader className="w-8 h-8 animate-spin text-white/70" />
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8 font-sans">
        <button onClick={() => navigate('/admin/calls')} className="text-white/80 hover:text-white mb-6 flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to calls
        </button>
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300 max-w-2xl">{err || 'No data'}</div>
      </div>
    )
  }

  const { call, turns } = data
  const u  = call.users || {}
  const js = call.summary_json || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden font-sans">
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-blue-500/15 blur-3xl animate-blob-slow pointer-events-none" />

      <div className="relative">
        <div className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/admin/calls')}
              className="text-white/70 hover:text-white transition w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-300" />
                {fmtDate(call.started_at)}
              </h1>
              <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {call.call_sid || call.id}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
              {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Customer card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 animate-fade-in">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Customer</h3>
            <div className="flex flex-wrap gap-6 text-white">
              <InfoItem icon={UserIcon} color="text-pink-300"  label="Name"  value={u.name  || '—'} />
              <InfoItem icon={Mail}     color="text-blue-300"  label="Email" value={u.email || '—'} />
              <InfoItem icon={Phone}    color="text-green-300" label="Phone" value={u.phone || '—'} />
            </div>
          </div>

          {/* Scenario */}
          {call.scenario && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 animate-fade-in">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Scenario</h3>
              <p className="text-gray-200 text-sm leading-relaxed">{call.scenario}</p>
            </div>
          )}

          {/* Recording */}
          <div className="animate-fade-in"><AudioPlayer src={call.recording_url} /></div>

          {/* Metrics */}
          <div className="animate-fade-in"><MetricsBar call={call} /></div>

          {/* Summary + Transcript */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <SummaryCard summary={call.summary} summaryJson={call.summary_json} />
            <TranscriptView turns={turns} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
