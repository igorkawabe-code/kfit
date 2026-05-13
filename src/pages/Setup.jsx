import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getTextColor } from '../lib/utils'

const FAMILY_PRESETS = [
  { name: 'Igor Kawabe', age: 45, gender: 'M', color: '#5C5C5C', bio: 'Adora treinar, força e esporte. Adora ser desafiado. Semana corrida, mas nunca desiste.', weekly_goal: 5 },
  { name: 'Renata Kawabe', age: 44, gender: 'F', color: '#FF6B9D', bio: 'Precisa de estímulo e treina para a saúde mental. Adora a zona de conforto, mas sabe que o treino é essencial.', weekly_goal: 3 },
  { name: 'Ian Kawabe', age: 16, gender: 'M', color: '#00D4FF', bio: 'Disciplinado, faz dieta e treina desde os 13 anos. Foco total no bodybuilding.', weekly_goal: 5 },
  { name: 'Clara Kawabe', age: 15, gender: 'F', color: '#FF9500', bio: 'Atleta de jiujitsu, ex-ginasta. Cheia de força e adora um desafio.', weekly_goal: 4 },
  { name: 'Clara Medeiros', age: 15, gender: 'F', color: '#F0F0F0', bio: 'Namorada do Ian, tem 15 anos e adora treinar junto com a família Kawabe.', weekly_goal: 3 },
]

const COLORS = ['#5C5C5C', '#FF6B9D', '#00D4FF', '#FF9500', '#F0F0F0', '#B4FF00', '#A78BFA', '#FF4444']

export default function Setup() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', age: '', gender: 'M', bio: '', weekly_goal: 3, color: '#B4FF00' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function selectPreset(preset) {
    setForm({ ...preset, age: String(preset.age) })
    setSelected(preset.name)
    setStep(2)
  }

  function selectCustom() {
    setForm({ name: '', age: '', gender: 'M', bio: '', weekly_goal: 3, color: '#B4FF00' })
    setSelected('custom')
    setStep(2)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Digite seu nome'); return }
    if (!form.age || isNaN(form.age)) { setError('Informe sua idade'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: form.name.trim(),
      age: parseInt(form.age),
      gender: form.gender,
      bio: form.bio,
      weekly_goal: parseInt(form.weekly_goal) || 3,
      color: form.color,
    }, { onConflict: 'id' })
    if (error) { setError(error.message); setLoading(false); return }
    await refreshProfile()
    navigate('/')
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#060606] px-6 pb-12 safe-top animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-4">
            <span className="font-display text-2xl text-[#060606]">KF</span>
          </div>
          <h1 className="font-display text-4xl tracking-wider text-white">QUEM É VOCÊ?</h1>
          <p className="text-zinc-500 text-sm mt-1 font-body">Selecione seu perfil na família</p>
        </div>
        <div className="space-y-3">
          {FAMILY_PRESETS.map((p) => (
            <button key={p.name} onClick={() => selectPreset(p)}
              className="w-full bg-surface rounded-2xl p-4 border border-zinc-800 text-left active:scale-[0.98] transition-transform flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-xl flex-shrink-0"
                style={{ backgroundColor: p.color, color: getTextColor(p.color) }}>
                {p.name.split(' ')[0][0]}
              </div>
              <div>
                <div className="font-body font-semibold text-white">{p.name}</div>
                <div className="text-zinc-500 text-sm">{p.age} anos · Meta: {p.weekly_goal}x/sem</div>
              </div>
              <svg className="ml-auto text-zinc-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
          <button onClick={selectCustom}
            className="w-full bg-surface2 rounded-2xl p-4 border border-zinc-700 border-dashed text-zinc-400 font-body font-medium active:scale-[0.98] transition-transform">
            + Criar perfil personalizado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#060606] px-6 pb-12 safe-top animate-fade-in">
      <button onClick={() => setStep(1)} className="flex items-center gap-2 text-zinc-400 mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="font-body text-sm">Voltar</span>
      </button>
      <h1 className="font-display text-4xl tracking-wider text-white mb-6">SEU PERFIL</h1>
      <div className="space-y-4">
        <div>
          <label className="label">Nome completo</label>
          <input className="input-field" placeholder="Nome Sobrenome" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Idade</label>
            <input className="input-field" type="number" placeholder="Ex: 30" value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
          </div>
          <div className="flex-1">
            <label className="label">Meta semanal</label>
            <input className="input-field" type="number" min="1" max="7" placeholder="3" value={form.weekly_goal}
              onChange={e => setForm(f => ({ ...f, weekly_goal: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Gênero</label>
          <div className="flex gap-3">
            {[['M', 'Masculino'], ['F', 'Feminino']].map(([val, label]) => (
              <button key={val} onClick={() => setForm(f => ({ ...f, gender: val }))}
                className={`flex-1 py-3 rounded-xl font-body font-medium text-sm border transition-all ${form.gender === val ? 'border-accent text-accent bg-accent/10' : 'border-zinc-700 text-zinc-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Cor do perfil</label>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map(color => (
              <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                className={`w-10 h-10 rounded-full border-2 transition-all ${form.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
        <button className="btn-primary mt-4" onClick={handleSave} disabled={loading}>
          {loading ? '...' : 'SALVAR E ENTRAR'}
        </button>
      </div>
    </div>
  )
}
