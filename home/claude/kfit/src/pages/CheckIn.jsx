import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

const WORKOUT_TAGS = [
  { group: 'Musculação', tags: ['Peito', 'Costas', 'Pernas', 'Glúteos', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Superiores', 'Inferiores', 'Full Body'] },
  { group: 'Esportes', tags: ['Jiujitsu', 'Boxe', 'Beach Tennis', 'Tênis', 'Padel', 'Ginástica'] },
  { group: 'Cardio & Outros', tags: ['Corrida', 'Bike', 'Cardio', 'Funcional', 'Mobilidade'] },
]

export default function CheckIn() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [todayWorkouts, setTodayWorkouts] = useState([])
  const fileRef = useRef()

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => { loadTodayWorkouts() }, [date, profile])

  async function loadTodayWorkouts() {
    if (!profile) return
    const { data } = await supabase
      .from('workouts').select('*')
      .eq('user_id', profile.id).eq('date', date)
      .order('created_at', { ascending: false })
    setTodayWorkouts(data || [])
  }

  function toggleTag(tag) {
    setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function uploadPhoto(userId) {
    if (!photo) return null
    const ext = photo.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('workout-photos').upload(path, photo, { contentType: photo.type })
    if (error) return null
    const { data } = supabase.storage.from('workout-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (!profile || loading) return
    setLoading(true)
    const photoUrl = await uploadPhoto(profile.id)
    const notesText = [selectedTags.join(', '), notes].filter(Boolean).join(' · ')
    const { error } = await supabase.from('workouts').insert({
      user_id: profile.id, date, notes: notesText || null, photo_url: photoUrl,
    })
    if (!error) { setSuccess(true); setTimeout(() => navigate('/'), 1800) }
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('workouts').delete().eq('id', id)
    loadTodayWorkouts()
  }

  const displayDate = date === today ? 'Hoje' : format(new Date(date + 'T12:00:00'), "d 'de' MMMM", { locale: ptBR })

  if (success) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen gap-4 animate-pop">
          <div className="w-24 h-24 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-5xl">✓</div>
          <h2 className="font-display text-4xl tracking-wider text-accent">TREINO FEITO!</h2>
          <p className="text-zinc-400 font-body text-sm">{displayDate} registrado</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-5 pb-6 safe-top animate-fade-in">
        <div className="mb-6">
          <h1 className="page-title">CHECK-IN</h1>
          <p className="text-zinc-500 font-body text-sm mt-1">Registre seu treino</p>
        </div>

        <div className="card mb-4">
          <label className="label">Data do treino</label>
          <div className="flex items-center gap-3">
            <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} className="input-field flex-1" />
            {date === today && <span className="px-3 py-2 rounded-lg text-sm font-body font-semibold bg-accent/20 text-accent">Hoje</span>}
          </div>
        </div>

        {todayWorkouts.length > 0 && (
          <div className="mb-4">
            <p className="section-title mb-2">{todayWorkouts.length} treino{todayWorkouts.length > 1 ? 's' : ''} — {displayDate}</p>
            <div className="space-y-2">
              {todayWorkouts.map(w => (
                <div key={w.id} className="card border-accent/20 bg-accent/5 flex items-center gap-3">
                  {w.photo_url && <img src={w.photo_url} alt="treino" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-accent text-sm font-semibold font-body">✓ Registrado</p>
                    <p className="text-zinc-400 text-xs truncate">{w.notes || 'Sem anotações'}</p>
                  </div>
                  <button onClick={() => handleDelete(w.id)} className="text-red-400 text-xs border border-red-400/30 rounded-lg px-2.5 py-1.5 flex-shrink-0">Remover</button>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-zinc-800 pt-3">
              <p className="text-zinc-500 text-xs font-body text-center">Treinou mais de uma vez? Adicione outro abaixo 👇</p>
            </div>
          </div>
        )}

        {/* Foto — câmera ou galeria */}
        <div className="card mb-4">
          <label className="label">Foto do treino <span className="text-zinc-600">(opcional)</span></label>
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded-xl" />
              <button onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white text-xs">✕</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click() }}
                className="flex-1 h-24 bg-surface2 border border-dashed border-zinc-600 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span className="text-zinc-500 text-xs font-body">Galeria</span>
              </button>
              <button onClick={() => { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click() }}
                className="flex-1 h-24 bg-surface2 border border-dashed border-zinc-600 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4FF00" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span className="text-zinc-500 text-xs font-body">Câmera</span>
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="mb-4 space-y-4">
          <label className="label">O que você treinou? <span className="text-zinc-600">(opcional)</span></label>
          {WORKOUT_TAGS.map(group => (
            <div key={group.group}>
              <p className="text-zinc-600 text-xs font-mono font-semibold mb-2 uppercase tracking-wider">{group.group}</p>
              <div className="flex flex-wrap gap-2">
                {group.tags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-body font-medium border transition-all ${selectedTags.includes(tag) ? 'border-accent text-accent bg-accent/10' : 'border-zinc-700 text-zinc-400'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="label">Anotações extras <span className="text-zinc-600">(opcional)</span></label>
          <textarea className="input-field resize-none" rows={3} placeholder="Ex: PR no supino, 100kg 3x5..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? '...' : todayWorkouts.length > 0 ? 'ADICIONAR OUTRO TREINO' : 'REGISTRAR TREINO'}
        </button>
      </div>
    </Layout>
  )
}
