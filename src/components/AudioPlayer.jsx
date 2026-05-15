import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

function fmt(s) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function AudioPlayer({ src }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [vol, setVol] = useState(1)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const a = ref.current
    if (!a) return
    const onTime = () => setCur(a.currentTime)
    const onMeta = () => setDur(a.duration)
    const onEnd  = () => setPlaying(false)
    const onErr  = () => setErr(true)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    a.addEventListener('error', onErr)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('error', onErr)
    }
  }, [src])

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }

  const seek = (e) => {
    const a = ref.current
    if (!a) return
    a.currentTime = Number(e.target.value)
    setCur(a.currentTime)
  }

  const changeVol = (e) => {
    const a = ref.current
    if (!a) return
    a.volume = Number(e.target.value)
    setVol(a.volume)
  }

  if (!src) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-gray-400">
        No recording available for this call.
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
      <audio ref={ref} src={src} preload="metadata" />
      {err ? (
        <div className="text-red-300 text-sm">Failed to load recording. Signed URL may have expired.</div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white flex items-center justify-center hover:scale-105 transition"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-white/70 text-sm tabular-nums w-12">{fmt(cur)}</span>
              <input
                type="range" min={0} max={dur || 0} value={cur} step="0.1"
                onChange={seek}
                className="flex-1 accent-pink-400"
              />
              <span className="text-white/70 text-sm tabular-nums w-12 text-right">{fmt(dur)}</span>
            </div>
            <div className="flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-white/60" />
              <input
                type="range" min={0} max={1} step="0.05" value={vol}
                onChange={changeVol}
                className="flex-1 accent-blue-400"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Stereo recording — caller on left channel, agent (Rahul) on right.</p>
        </>
      )}
    </div>
  )
}
