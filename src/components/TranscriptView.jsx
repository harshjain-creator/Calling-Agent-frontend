import { Bot, User } from 'lucide-react'

export default function TranscriptView({ turns }) {
  if (!turns || turns.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-gray-400">
        No transcript captured.
      </div>
    )
  }
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Transcript</h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {turns.map((t) => {
          const isBot = t.role === 'bot'
          return (
            <div key={t.idx} className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-300" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 border ${
                  isBot
                    ? 'bg-blue-500/20 border-blue-400/30 text-blue-50 rounded-tl-sm'
                    : 'bg-pink-500/20 border-pink-400/30 text-pink-50 rounded-tr-sm'
                }`}
              >
                <p className="text-sm">{t.text}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] uppercase tracking-wider text-white/40">
                  {t.language && <span>{t.language}</span>}
                  {isBot && t.latency_ms != null && <span>↳ {(t.latency_ms / 1000).toFixed(1)}s</span>}
                </div>
              </div>
              {!isBot && (
                <div className="w-8 h-8 rounded-full bg-pink-500/30 border border-pink-400/40 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-pink-300" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
