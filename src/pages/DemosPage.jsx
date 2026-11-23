import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, PhoneCall, Languages, Loader2, AlertCircle, Headphones,
  ChevronDown, Mic2, AudioLines,
  Landmark, Stethoscope, Flower2, Gauge, FlaskConical, Building2, BrickWall,
  Users, GraduationCap, Plane, Truck, Car, Cloud, Sofa, ShoppingCart,
} from 'lucide-react'

import DemoCallModal from '@/components/DemoCallModal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const ICONS = {
  Landmark, Stethoscope, Flower2, Gauge, FlaskConical, Building2, BrickWall,
  Users, GraduationCap, Plane, Truck, Car, Cloud, Sofa, ShoppingCart,
}

const VOICES = [
  { id: 'm', name: 'Rahul', label: 'Male' },
  { id: 'f', name: 'Riya',  label: 'Female' },
]

// Demo clips + scripts.json live in a public Catalyst Stratus bucket, not in
// the frontend bundle. Set VITE_DEMO_AUDIO_BASE to the bucket URL, e.g.
// https://demo-audio-development.zohostratus.in
const AUDIO_BASE = (import.meta.env.VITE_DEMO_AUDIO_BASE || '/demo-audio').replace(/\/+$/, '')

const fmt = s => (Number.isFinite(s) ? `0:${String(Math.floor(s)).padStart(2, '0')}` : '0:00')

/**
 * /demos — industry demo library. 15 industries × 3 everyday call scripts,
 * each voiced in 11 languages by the app's two agent voices (Rahul / Riya).
 * Audio + transcripts (scripts.json) are served from AUDIO_BASE — a public
 * Stratus bucket; one shared Audio object plays a clip at a time.
 */
export default function DemosPage() {
  const [data, setData]           = useState(null)
  const [loadError, setLoadErr]   = useState(null)
  const [lang, setLang]           = useState('en')
  const [voice, setVoice]         = useState('m')
  const [industryId, setIndustry] = useState('bfsi')
  const [openIds, setOpenIds]     = useState(null)      // null = default (first card open)
  const [playing, setPlaying]     = useState(null)      // scenario id
  const [loading, setLoading]     = useState(null)      // scenario id while buffering
  const [progress, setProgress]   = useState({ t: 0, d: 0 })
  const [livePreset, setLivePreset] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    fetch(`${AUDIO_BASE}/scripts.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch(e => setLoadErr(e.message))
    return () => audioRef.current?.pause()
  }, [])

  const industry = useMemo(
    () => data?.industries.find(i => i.id === industryId),
    [data, industryId],
  )
  const langInfo  = data?.languages.find(l => l.code === lang)
  const voiceInfo = VOICES.find(v => v.id === voice)

  const isOpen = (id, idx) => (openIds ? openIds.has(id) : idx === 0)

  function stop() {
    const a = audioRef.current
    if (a) { a.pause(); a.removeAttribute('src'); a.load() }
    audioRef.current = null
    setPlaying(null); setLoading(null); setProgress({ t: 0, d: 0 })
  }

  function pickIndustry(id) {
    if (id === industryId) return
    stop(); setIndustry(id); setOpenIds(null)
  }

  function toggleOpen(id, idx) {
    setOpenIds(prev => {
      const next = new Set(prev ?? (industry ? [industry.scenarios[0].id] : []))
      if (isOpen(id, idx)) next.delete(id); else next.add(id)
      return next
    })
  }

  function togglePlay(id, idx) {
    if (playing === id || loading === id) { stop(); return }
    stop()
    if (!isOpen(id, idx)) toggleOpen(id, idx)        // playing opens its drawer
    const a = new Audio(`${AUDIO_BASE}/${id}/${lang}-${voice}.mp3`)
    audioRef.current = a
    setLoading(id)
    a.addEventListener('playing', () => { setLoading(null); setPlaying(id) })
    a.addEventListener('timeupdate', () => setProgress({ t: a.currentTime, d: a.duration }))
    a.addEventListener('ended', () => { if (audioRef.current === a) stop() })
    a.addEventListener('error', () => { if (audioRef.current === a) stop() })
    a.play().catch(() => { if (audioRef.current === a) stop() })
  }

  function tryLive(s) {
    stop()
    setLivePreset({ gender: voice === 'f' ? 'female' : 'male', scenario: s.brief })
  }

  const IndustryIcon = ICONS[industry?.icon] ?? Headphones

  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 pt-10 lg:pt-14 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
            <Headphones className="size-3.5 text-[var(--color-accent)]" />
            Industry demos
          </span>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Hear the agent in <span className="text-gradient-shimmer">your industry</span>
          </h1>
          <p className="mt-4 text-base lg:text-lg leading-relaxed text-[var(--color-fg-muted)]">
            Everyday call openers for 15 industries, in 11 Indian languages, voiced by our
            male and female agents. Pick an industry, choose a language and voice, and press play.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--color-fg-muted)]">
            {['15 industries', '45 call scripts', '11 languages', '2 voices'].map(t => (
              <span key={t} className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1">{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 w-full px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-7xl glass-strong rounded-2xl p-3 sm:px-5 grid grid-cols-2 sm:flex sm:items-end gap-3 sm:gap-4">
          <div className="min-w-0 sm:w-60">
            <label htmlFor="demo-lang" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--color-fg-muted)]">
              <Languages className="size-3.5 text-[var(--color-accent)]" /> Language
            </label>
            <Select id="demo-lang" value={lang} disabled={!data}
                    onChange={e => { stop(); setLang(e.target.value) }}>
              {(data?.languages ?? [{ code: 'en', label: 'English', native: 'English' }]).map(l => (
                <option key={l.code} value={l.code}>
                  {l.code === 'en' ? l.label : `${l.label} · ${l.native}`}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-0 sm:w-56">
            <label htmlFor="demo-voice" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--color-fg-muted)]">
              <Mic2 className="size-3.5 text-[var(--color-accent)]" /> Voice
            </label>
            <Select id="demo-voice" value={voice} onChange={e => { stop(); setVoice(e.target.value) }}>
              {VOICES.map(v => <option key={v.id} value={v.id}>{v.name} ({v.label})</option>)}
            </Select>
          </div>
          <p className="hidden md:flex ml-auto items-center gap-2 pb-2.5 text-sm text-[var(--color-fg-muted)]">
            <AudioLines className="size-4 text-[var(--color-accent)]" />
            {playing
              ? <>Playing · {voiceInfo.name} in {langInfo?.label}</>
              : <>Press ▶ on any call to listen</>}
          </p>
        </div>
      </div>

      {/* ── Library ───────────────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 pb-20 pt-4">
        {loadError ? (
          <p className="mx-auto max-w-xl flex items-center justify-center gap-2 text-sm text-red-500 py-16">
            <AlertCircle className="size-4" /> Couldn't load the demos ({loadError}). Please refresh.
          </p>
        ) : !data ? (
          <p className="flex items-center justify-center gap-2 text-sm text-[var(--color-fg-muted)] py-16">
            <Loader2 className="size-4 animate-spin" /> Loading demos…
          </p>
        ) : (
          <div className="mx-auto max-w-7xl grid gap-6 lg:gap-10 lg:grid-cols-[290px_1fr]">
            {/* Industry list — chips on mobile, sidebar on desktop */}
            <nav aria-label="Industries"
                 className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-44 lg:self-start">
              <p className="hidden lg:block px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                Industries
              </p>
              {data.industries.map(ind => {
                const Icon = ICONS[ind.icon] ?? Headphones
                const active = ind.id === industryId
                return (
                  <button
                    key={ind.id} type="button" onClick={() => pickIndustry(ind.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`group relative shrink-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all border ${
                      active
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-fg)] font-semibold'
                        : 'border-[var(--color-border)] lg:border-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]'
                    }`}
                  >
                    <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-muted)] group-hover:bg-[var(--color-bg-elevated)]'
                    }`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="whitespace-nowrap lg:whitespace-normal leading-snug">{ind.name}</span>
                  </button>
                )
              })}
            </nav>

            {/* Scenario drawers */}
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={industryId}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <IndustryIcon className="size-6" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl font-semibold tracking-tight leading-tight">{industry?.name}</h2>
                      <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">
                        3 everyday calls · {voiceInfo.name} speaking {langInfo?.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {industry?.scenarios.map((s, i) => {
                      const open      = isOpen(s.id, i)
                      const isPlaying = playing === s.id
                      const isLoading = loading === s.id
                      const pct = isPlaying && progress.d ? (progress.t / progress.d) * 100 : 0
                      const panelId = `demo-panel-${s.id}`
                      const hasAudio = !s.audio || s.audio.includes(`${lang}-${voice}`)
                      return (
                        <article
                          key={s.id}
                          className={`rounded-2xl border bg-[var(--color-bg-elevated)] transition-all ${
                            isPlaying
                              ? 'border-[var(--color-accent)] shadow-xl shadow-[var(--color-accent-soft)]'
                              : open
                                ? 'border-[var(--color-border-strong)] shadow-md'
                                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                          }`}
                        >
                          {/* Drawer header */}
                          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                            <button
                              type="button" onClick={() => togglePlay(s.id, i)} disabled={!hasAudio}
                              title={hasAudio ? undefined : 'Audio coming soon'}
                              aria-label={hasAudio ? `${isPlaying || isLoading ? 'Stop' : 'Play'} ${s.title}` : `${s.title}: audio coming soon`}
                              className="relative shrink-0 inline-flex size-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bg-[linear-gradient(135deg,var(--gradient-1),var(--gradient-2))] disabled:opacity-35 disabled:shadow-none disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                              {isPlaying && <span className="absolute inset-0 rounded-full animate-pulse-ring bg-[var(--color-accent)] opacity-40" />}
                              {isLoading ? <Loader2 className="relative size-5 animate-spin" />
                                : isPlaying ? <Pause className="relative size-5" />
                                : <Play className="relative size-5 translate-x-[1px]" />}
                            </button>

                            <button
                              type="button" onClick={() => toggleOpen(s.id, i)}
                              aria-expanded={open} aria-controls={panelId}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-subtle)]">
                                  Call {i + 1} · {s.company}
                                </p>
                                <h3 className="font-semibold leading-snug">{s.title}</h3>
                                <p className="mt-0.5 text-sm text-[var(--color-fg-muted)] leading-snug line-clamp-2">{s.desc}</p>
                              </div>
                              <span className="hidden sm:block shrink-0 text-xs tabular-nums text-[var(--color-fg-subtle)]">
                                {!hasAudio ? 'Audio coming soon' : isPlaying ? `${fmt(progress.t)} / ${fmt(progress.d)}` : '~15 s'}
                              </span>
                              <ChevronDown className={`size-5 shrink-0 text-[var(--color-fg-muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {/* Progress line along the bottom of the header */}
                          <div className="mx-4 sm:mx-5 h-1 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-200" style={{ width: `${pct}%` }} />
                          </div>

                          {/* Drawer body */}
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div
                                id={panelId}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 sm:px-5 pb-5 pt-4">
                                  <div className="flex items-center gap-2 text-xs text-[var(--color-fg-subtle)]">
                                    <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 font-medium text-[var(--color-accent)]">
                                      {langInfo?.native}
                                    </span>
                                    <span>{voiceInfo.name} · what the agent says</span>
                                  </div>
                                  <blockquote
                                    lang={lang}
                                    className="mt-3 rounded-xl border-l-4 border-[var(--color-accent)] bg-[var(--color-bg-muted)] px-4 py-3 text-[15px] leading-relaxed text-[var(--color-fg)]"
                                  >
                                    {s.texts[lang]?.[voice]}
                                  </blockquote>
                                  <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <Button variant="gradient" size="sm" onClick={() => tryLive(s)}>
                                      <PhoneCall className="size-3.5" />
                                      Try this call on my phone
                                    </Button>
                                    <span className="text-xs text-[var(--color-fg-subtle)]">
                                      Free · the agent calls you with this scenario
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {!open && <div className="h-4" />}
                        </article>
                      )
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </section>

      <DemoCallModal
        open={!!livePreset}
        onOpenChange={o => { if (!o) setLivePreset(null) }}
        preset={livePreset}
      />
    </>
  )
}
