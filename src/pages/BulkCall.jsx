import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, FileText, Play, Loader, CheckCircle, AlertCircle,
  Phone, Trash2, Download,
} from 'lucide-react'
import { API_BASE } from '../config'

// Minimal CSV parser — handles quoted fields + escaped quotes.
function parseCSV(text) {
  const rows = []
  let i = 0, field = '', row = [], inQuote = false
  while (i < text.length) {
    const c = text[i]
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (c === '"') { inQuote = false; i++; continue }
      field += c; i++; continue
    }
    if (c === '"') { inQuote = true; i++; continue }
    if (c === ',') { row.push(field); field = ''; i++; continue }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''; i++; continue
    }
    field += c; i++
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.length && r.some(v => v.trim()))
}

function csvToObjects(text) {
  const rows = parseCSV(text)
  if (!rows.length) return []
  const header = rows[0].map(h => h.trim().toLowerCase())
  const aliases = {
    name: ['name', 'full name', 'customer'],
    email: ['email', 'e-mail', 'mail'],
    phone: ['phone', 'phone_number', 'phone number', 'mobile', 'number'],
    scenario: ['scenario', 'context', 'pitch'],
  }
  const colIdx = {}
  for (const key of Object.keys(aliases)) {
    colIdx[key] = header.findIndex(h => aliases[key].includes(h))
  }
  return rows.slice(1).map(r => ({
    name:     colIdx.name >= 0    ? (r[colIdx.name]    || '').trim() : '',
    email:    colIdx.email >= 0   ? (r[colIdx.email]   || '').trim() : '',
    phone:    colIdx.phone >= 0   ? (r[colIdx.phone]   || '').trim() : '',
    scenario: colIdx.scenario >= 0 ? (r[colIdx.scenario] || '').trim() : '',
  }))
}

function validateRow(r) {
  if (!r.name)  return 'name required'
  if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return 'invalid email'
  const digits = (r.phone || '').replace(/\D/g, '')
  if (digits.length < 10) return 'phone < 10 digits'
  return null
}

const SAMPLE_CSV =
  'name,email,phone,scenario\n' +
  'Harsh Jain,harsh@example.com,9876543210,I am calling from TeamLease about staffing services\n' +
  'Priya Singh,priya@example.com,9123456780,\n'

export default function BulkCall() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [rows, setRows] = useState([])
  const [defaultScenario, setDefaultScenario] = useState('')
  const [delayMs, setDelayMs] = useState(4000)
  const [maxConcur, setMaxConcur] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [runId, setRunId] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  const ingestFile = async (f) => {
    setError(null)
    if (!f) return
    if (!/\.csv$/i.test(f.name) && f.type !== 'text/csv' && f.type !== 'application/vnd.ms-excel') {
      setError(`Not a CSV file: ${f.name}`)
      return
    }
    const text = await f.text()
    const parsed = csvToObjects(text)
    if (!parsed.length) { setError('No rows parsed. Check CSV header row.'); return }
    setRows(parsed)
  }

  const handleFile = (e) => ingestFile(e.target.files?.[0])

  const onDragOver = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    setDragging(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragging(false)
  }
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragging(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) ingestFile(f)
  }

  const clearRows = () => { setRows([]); if (fileRef.current) fileRef.current.value = '' }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bulk_call_sample.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const validRows  = rows.map(r => ({ ...r, _err: validateRow(r) })).map(r => {
    if (!r.scenario && !defaultScenario.trim()) {
      return { ...r, _err: r._err || 'no scenario (set default below)' }
    }
    return r
  })
  const okCount    = validRows.filter(r => !r._err).length
  const errCount   = validRows.length - okCount

  const submit = async () => {
    setError(null); setSubmitting(true); setProgress(null); setRunId(null)
    try {
      const payload = {
        rows: validRows.filter(r => !r._err).map(r => ({
          name: r.name, email: r.email, phone: r.phone, scenario: r.scenario || defaultScenario,
        })),
        scenario: defaultScenario,
        delay_ms: delayMs,
        max_concurrent: maxConcur,
        audio_mode: 'handset',
      }
      if (!payload.rows.length) throw new Error('No valid rows to dial')
      const r = await fetch(`${API_BASE}/bulk_call`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok || data.status !== 'started') throw new Error(data.error || 'Failed to start')
      setRunId(data.run_id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Poll progress
  useEffect(() => {
    if (!runId) return
    let active = true
    const tick = async () => {
      try {
        const r = await fetch(`${API_BASE}/bulk_call/${runId}`)
        if (r.ok) {
          const d = await r.json()
          if (active) setProgress(d)
          if (d.done) return
        }
      } catch {}
      if (active) setTimeout(tick, 2000)
    }
    tick()
    return () => { active = false }
  }, [runId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden font-sans">
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-blue-500/20 blur-3xl animate-blob-slow pointer-events-none" />

      <div className="relative">
        <div className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-white/70 hover:text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Bulk Call</h1>
              <p className="text-xs text-gray-400 mt-0.5">Upload CSV → dial everyone</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* CSV upload */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-300" /> CSV File
              </h2>
              <button onClick={downloadSample} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Sample CSV
              </button>
            </div>

            <label
              onDragEnter={onDragOver}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
                dragging
                  ? 'border-pink-400 bg-pink-500/10'
                  : 'border-white/20 hover:border-pink-400/50 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Upload className={`w-8 h-8 mb-2 transition ${dragging ? 'text-pink-300' : 'text-gray-400'}`} />
              <p className="text-white text-sm font-medium pointer-events-none">
                {dragging ? 'Drop CSV here' : 'Click to upload or drop CSV'}
              </p>
              <p className="text-xs text-gray-400 mt-1 pointer-events-none">Columns: name, email, phone, scenario (optional)</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>

            {rows.length > 0 && (
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="text-emerald-400">{okCount} ready</span>
                {errCount > 0 && <span className="text-red-400">· {errCount} invalid</span>}
                <button onClick={clearRows} className="ml-auto text-gray-400 hover:text-white flex items-center gap-1.5 text-xs">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden animate-fade-in">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 sticky top-0">
                    <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Scenario</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.map((r, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-2 text-white">{r.name || '—'}</td>
                        <td className="px-4 py-2 text-gray-300">{r.email || '—'}</td>
                        <td className="px-4 py-2 text-gray-300">{r.phone || '—'}</td>
                        <td className="px-4 py-2 text-gray-300 max-w-xs truncate">{r.scenario || <em className="text-gray-500">default</em>}</td>
                        <td className="px-4 py-2">
                          {r._err
                            ? <span className="text-red-400 text-xs">{r._err}</span>
                            : <span className="text-emerald-400 text-xs">ready</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-white">Settings</h2>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Default Scenario (used for rows without one)</label>
              <textarea
                value={defaultScenario} onChange={e => setDefaultScenario(e.target.value)}
                rows={3} placeholder="I am calling from TeamLease about staffing services..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Delay between dials: {(delayMs / 1000).toFixed(1)}s
                </label>
                <input type="range" min={1000} max={15000} step={500} value={delayMs}
                  onChange={e => setDelayMs(Number(e.target.value))}
                  className="w-full accent-pink-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Max concurrent calls: {maxConcur}
                </label>
                <input type="range" min={1} max={10} step={1} value={maxConcur}
                  onChange={e => setMaxConcur(Number(e.target.value))}
                  className="w-full accent-blue-400" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300 text-sm">{error}</div>
            </div>
          )}

          {/* Submit */}
          {!runId && (
            <button
              onClick={submit}
              disabled={submitting || okCount === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 rounded-xl transition hover:scale-[1.01] disabled:scale-100 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader className="w-5 h-5 animate-spin" /> Starting...</>
                : <><Play className="w-5 h-5" /> Dial {okCount} {okCount === 1 ? 'Call' : 'Calls'}</>}
            </button>
          )}

          {/* Progress */}
          {runId && progress && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-pink-300" />
                  Bulk Run Progress
                </h2>
                {progress.done
                  ? <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Done</span>
                  : <span className="text-blue-300 text-sm flex items-center gap-1"><Loader className="w-4 h-4 animate-spin" /> Running</span>}
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{progress.succeeded + progress.failed} / {progress.total}</span>
                  <span>{progress.succeeded} dialed · {progress.failed} failed</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-blue-500 transition-all"
                    style={{ width: `${progress.total ? ((progress.succeeded + progress.failed) / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="max-h-[260px] overflow-y-auto space-y-1.5">
                {progress.results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-md px-3 py-2">
                    <span className="text-gray-500 w-6">{r.idx + 1}</span>
                    <span className="text-white flex-1 truncate">{r.name} · {r.phone}</span>
                    {r.status === 'dialed' && <span className="text-emerald-400">✓ dialed</span>}
                    {r.status === 'failed'  && <span className="text-red-400">✗ {r.error}</span>}
                    {r.status === 'skipped' && <span className="text-yellow-400">skipped</span>}
                  </div>
                ))}
              </div>

              {progress.done && (
                <button
                  onClick={() => navigate('/admin/calls')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition"
                >
                  View calls in dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
