import { Clock, AlertOctagon, MessageSquareWarning, Languages, PhoneOff } from 'lucide-react'

function fmtDur(s) {
  if (s == null || !isFinite(s)) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}m ${sec}s`
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-pink-500/20 to-blue-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-white/80" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-white text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  )
}

export default function MetricsBar({ call }) {
  if (!call) return null
  return (
    <div className="flex flex-wrap gap-3">
      <Stat icon={Clock}                label="Duration"      value={fmtDur(call.duration_s)} />
      <Stat icon={PhoneOff}             label="Hangup"        value={(call.hangup_reason || 'unknown').replace(/_/g, ' ')} />
      <Stat icon={AlertOctagon}         label="Barge-ins"     value={call.barge_in_count ?? 0} />
      <Stat icon={MessageSquareWarning} label="Reprompts"     value={call.reprompt_count ?? 0} />
      <Stat icon={Languages}            label="Language"      value={call.language_initial || '—'} />
    </div>
  )
}
