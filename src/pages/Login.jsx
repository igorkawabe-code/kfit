import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
          <span className="font-display text-3xl text-[#060606] tracking-wider">KF</span>
        </div>
        <h1 className="font-display text-5xl tracking-widest text-white">KFIT</h1>
        <p className="text-zinc-500 font-body text-sm mt-1">Família Kawabe</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex bg-surface2 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2.5 rounded-lg font-body font-semibold text-sm transition-all ${
              mode === 'login' ? 'bg-surface3 text-white' : 'text-zinc-500'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2.5 rounded-lg font-body font-semibold text-sm transition-all ${
              mode === 'register' ? 'bg-surface3 text-white' : 'text-zinc-500'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-body">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm font-body">
              {success}
            </div>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </form>
      </div>
    </div>
  )
}
