import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getTextColor } from '../lib/utils'
import Avatar from '../components/Avatar'
import Layout from '../components/Layout'

const BADGES = [
  { id: 'first', icon: '🏋️', label: 'Primeiro Treino', threshold: 1 },
  { id: 'ten', icon: '💪', label: '10 Treinos', threshold: 10 },
  { id: 'fifty', icon: '🔥', label: '50 Treinos', threshold: 50 },
  { id: 'hundred', icon: '💯', label: '100 Treinos', threshold: 100 },
]

const COLORS = ['#5C5C5C', '#FF6B9D', '#00D4FF', '#FF9500', '#F0F0F0', '#B4FF00', '#A78BFA', '#FF4444']

export default function Profile() {
  const { profile, signOut, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, age: profile.age, weekly_goal: profile.weekly_goal, bio: profile.bio, color: profile.color })
      loadStats()
    }
  }, [profile])

  async function loadStats() {
    const { count } = await supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', profile.id)
    setTotalWorkouts(count || 0)
  }

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      name: form.name, age: parseInt(form.age),
      weekly_goal: parseInt(form.weekly_goal), bio: form.bio, color: form.color,
    }).eq('id', profile.id)
    if (!error) { await refreshProfile(); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setLoading(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file || !profile) return
    setPhotoLoading(true)
    const ext = file.name.split('.').pop()
    const path = `profiles/${profile.id}.${ext}`
    await supabase.storage.from('workout-photos').remove([path])
    const { error } = await supabase.storage.from('workout-photos').upload(path, file, { contentType: file.type, upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('workout-photos').getPublicUrl(path)
      await supabase.from('profiles').update({ photo_url: data.publicUrl + '?t=' + Date.now() }).eq('id', profile.id)
      await refreshProfile()
    }
    setPhotoLoading(false)
  }

  async function handleRemovePhoto() {
    if (!profile) return
    await supabase.from('profiles').update({ photo_url: null }).eq('id', profile.id)
    await refreshProfile()
  }

  const earnedBadges = BADGES.filter(b => totalWorkouts >= b.threshold)
  const unearned = BADGES.filter(b => totalWorkouts < b.threshold)

  return (
    <Layout>
      <div className="px-5 pb-6 safe-top animate-fade-in">
        {/* Header com foto */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar profile={profile} size="2xl" />
            <button onClick={() => fileRef.current.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              {photoLoading
                ? <span className="text-[#060606] text-xs animate-spin">⟳</span>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#060606" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl tracking-wider text-white leading-tight">{profile?.name?.toUpperCase()}</h1>
            <p className="text-zinc-500 font-body text-sm">{profile?.age} anos · Meta: {profile?.weekly_goal}x/sem</p>
            {profile?.photo_url && (
              <button onClick={handleRemovePhoto} className="text-red-400 text-xs mt-1 font-body">Remover foto</button>
            )}
          </div>
          <button onClick={() => setEditing(!editing)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${editing ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-700 text-zinc-400'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card text-center">
            <div className="font-display text-3xl text-accent">{totalWorkouts}</div>
            <div className="text-zinc-500 text-xs font-body mt-0.5">treinos</div>
          </div>
          <div className="card text-center">
            <div className="font-display text-3xl text-white">{profile?.weekly_goal}</div>
            <div className="text-zinc-500 text-xs font-body mt-0.5">meta/sem</div>
          </div>
          <div className="card text-center">
            <div className="font-display text-3xl text-white">{earnedBadges.length}</div>
            <div className="text-zinc-500 text-xs font-body mt-0.5">conquistas</div>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="card mb-5 space-y-4">
            <div className="section-title">Editar perfil</div>
            <div>
              <label className="label">Nome completo</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label">Idade</label>
                <input className="input-field" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="label">Meta semanal</label>
                <input className="input-field" type="number" min="1" max="7" value={form.weekly_goal} onChange={e => setForm(f => ({ ...f, weekly_goal: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Cor do anel</label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map(color => (
                  <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${form.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={loading} className="btn-primary">
              {loading ? '...' : 'SALVAR'}
            </button>
          </div>
        )}

        {saved && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm font-body mb-4 text-center">
            Perfil atualizado! ✓
          </div>
        )}

        {/* Badges */}
        <div className="section-title mb-3">Conquistas</div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {earnedBadges.map(badge => (
            <div key={badge.id} className="card border-zinc-600 text-center py-4">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-body font-semibold text-white text-sm">{badge.label}</div>
            </div>
          ))}
          {unearned.map(badge => (
            <div key={badge.id} className="card opacity-30 text-center py-4">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-body font-semibold text-zinc-400 text-sm">{badge.label}</div>
              <div className="text-zinc-600 text-xs mt-0.5">{badge.threshold} treinos</div>
            </div>
          ))}
        </div>

        <button onClick={signOut} className="btn-secondary">Sair da conta</button>
      </div>
    </Layout>
  )
}
