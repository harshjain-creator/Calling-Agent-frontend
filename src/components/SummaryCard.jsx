import OutcomeBadge from './OutcomeBadge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function SummaryCard({ summary, summaryJson }) {
  const js = summaryJson || {}
  if (!summary && !Object.keys(js).length) {
    return (
      <Card>
        <CardContent className="pt-6 text-[var(--color-fg-muted)] text-sm">
          No summary available yet.
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <p className="text-[var(--color-fg-muted)] leading-relaxed text-sm">{summary}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
        </div>

        {js.intent && (
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-1">Intent</p>
            <p className="text-[var(--color-fg)] text-sm">{js.intent}</p>
          </div>
        )}

        {js.key_points && js.key_points.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-2">Key Points</p>
            <ul className="space-y-1.5">
              {js.key_points.map((p, i) => (
                <li key={i} className="text-[var(--color-fg-muted)] text-sm flex gap-2">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {js.next_step && (
          <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] p-3">
            <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-1">Next Step</p>
            <p className="text-[var(--color-fg)] text-sm font-medium">{js.next_step}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
