const OUTCOME_STYLE = {
  interested:         'bg-green-500/30  text-green-300  border-green-400/40',
  not_interested:     'bg-red-500/30    text-red-300    border-red-400/40',
  callback_requested: 'bg-blue-500/30   text-blue-300   border-blue-400/40',
  meeting_scheduled:  'bg-purple-500/30 text-purple-300 border-purple-400/40',
  information_shared: 'bg-gray-500/30   text-gray-300   border-gray-400/40',
  unclear:            'bg-yellow-500/30 text-yellow-300 border-yellow-400/40',
  call_dropped:       'bg-orange-500/30 text-orange-300 border-orange-400/40',
}

const SENTIMENT_STYLE = {
  positive: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40',
  neutral:  'bg-slate-500/30   text-slate-300   border-slate-400/40',
  negative: 'bg-rose-500/30    text-rose-300    border-rose-400/40',
}

export default function OutcomeBadge({ value, kind = 'outcome' }) {
  if (!value) return null
  const styleMap = kind === 'sentiment' ? SENTIMENT_STYLE : OUTCOME_STYLE
  const cls = styleMap[value] || 'bg-white/10 text-white/70 border-white/20'
  const label = value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}
