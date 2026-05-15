import OutcomeBadge from './OutcomeBadge'

export default function SummaryCard({ summary, summaryJson }) {
  const js = summaryJson || {}
  if (!summary && !Object.keys(js).length) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-gray-400">
        No summary available yet.
      </div>
    )
  }
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 space-y-5">
      <h3 className="text-lg font-bold text-white">Summary</h3>

      {summary && (
        <p className="text-gray-200 leading-relaxed text-sm">{summary}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {js.outcome && <OutcomeBadge value={js.outcome} kind="outcome" />}
        {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
      </div>

      {js.intent && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Intent</p>
          <p className="text-gray-200 text-sm">{js.intent}</p>
        </div>
      )}

      {js.key_points && js.key_points.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Key Points</p>
          <ul className="space-y-1.5">
            {js.key_points.map((p, i) => (
              <li key={i} className="text-gray-200 text-sm flex gap-2">
                <span className="text-pink-400">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {js.next_step && (
        <div className="bg-gradient-to-r from-pink-500/10 to-blue-500/10 border border-white/20 rounded-lg p-3">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Next Step</p>
          <p className="text-white text-sm font-medium">{js.next_step}</p>
        </div>
      )}
    </div>
  )
}
