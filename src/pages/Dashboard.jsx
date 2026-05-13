import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, differenceInDays, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

import { getDisplayName } from '../lib/utils'

function getFirstName(name) {
  return name?.split(' ')[0] || ''
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [weekWorkouts, setWeekWorkouts] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [weekRanking, setWeekRanking] = useState([])
  const [streak, setStreak] = useState(0)
  const [aiMessage, setAiMessage] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  const loadData = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')

    const [todayRes, weekRes, profilesRes, allWorkoutsRes] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', profile.id).eq('date', today).single(),
      supabase.from('workouts').select('*').eq('user_id', profile.id).gte('date', weekStart).lte('date', weekEnd),
      supabase.from('profiles').select('*'),
      supabase.from('workouts').select('user_id, date').gte('date', weekStart).lte('date', weekEnd),
    ])

    setTodayWorkout(todayRes.data)
    setWeekWorkouts(weekRes.data || [])
    setAllProfiles(profilesRes.data || [])

    // Build week ranking
    const counts = {}
    ;(allWorkoutsRes.data || []).forEach(w => {
      counts[w.user_id] = (counts[w.user_id] || 0) + 1
    })
    const ranked = (profilesRes.data || [])
      .map(p => ({ ...p, count: counts[p.id] || 0 }))
      .sort((a, b) => b.count - a.count)
    setWeekRanking(ranked)

    // Calculate streak for current user
    const { data: recentWorkouts } = await supabase
      .from('workouts').select('date').eq('user_id', profile.id)
      .order('date', { ascending: false }).limit(60)

    if (recentWorkouts?.length) {
      const dates = new Set(recentWorkouts.map(w => w.date))
      let s = 0
      let checkDate = todayRes.data ? new Date() : subDays(new Date(), 1)
      while (dates.has(format(checkDate, 'yyyy-MM-dd'))) {
        s++
        checkDate = subDays(checkDate, 1)
      }
      setStreak(s)
    }

    // Load AI message
    await loadAiMessage(todayRes.data)
    setLoading(false)
  }, [profile, today])

  useEffect(() => { loadData() }, [loadData])

  async function loadAiMessage(todayWk) {
    if (!profile) return
    const msgType = todayWk ? 'post_workout' : 'pre_workout'

    // Check cached
    const { data: cached } = await supabase
      .from('ai_messages').select('message').eq('user_id', profile.id)
      .eq('date', today).eq('type', msgType).single()

    if (cached) { setAiMessage(cached.message); return }

    // Generate new
    setAiLoading(true)
    try {
      const res = await fetch('/.netlify/functions/ai-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { name: profile.name, age: profile.age, gender: profile.gender, bio: profile.bio },
          workoutCount: todayWk ? 1 : 0,
          messageType: msgType
        })
      })
      const { message } = await res.json()
      if (message) {
        setAiMessage(message)
        await supabase.from('ai_messages').upsert({
          user_id: profile.id, date: today, type: msgType, message
        }, { onConflict: 'user_id,date,type' })
      }
    } catch (e) {
      console.error('AI error:', e)
    } finally {
      setAiLoading(false)
    }
  }

  const weekDays = ['S', 'T', 'Q', 'Q', 'S']
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const workedDays = new Set((weekWorkouts || []).map(w => w.date))

  const medals = ['🥇', '🥈', '🥉', '']

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-accent font-display text-2xl animate-pulse">CARREGANDO...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-5 pb-6 safe-top space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-zinc-500 font-body text-sm">{getGreeting()},</p>
            <h1 className="font-display text-4xl tracking-wider text-white leading-tight">
              {getFirstName(profile?.name).toUpperCase()}
            </h1>
          </div>
          <Avatar profile={profile} size="lg" />
        </div>

        {/* AI Message */}
        <div className="card border-zinc-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: profile?.color || '#B4FF00' }} />
          <div className="pl-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold tracking-widest text-zinc-500 uppercase">IA · {todayWorkout ? 'Pós-treino' : 'Pré-treino'}</span>
            </div>
            {aiLoading ? (
              <div className="space-y-2">
                <div className="h-3 bg-surface2 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-surface2 rounded animate-pulse w-1/2" />
              </div>
            ) : (
              <p className="text-white font-body text-sm leading-relaxed">{aiMessage || 'Bora treinar hoje! 💪'}</p>
            )}
          </div>
        </div>

        {/* Streak + Today */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <div className="text-3xl mb-1">🔥</div>
            <div className="font-display text-3xl text-accent">{streak}</div>
            <div className="text-zinc-500 text-xs font-body mt-0.5">dias seguidos</div>
          </div>
          <div className={`card text-center border ${todayWorkout ? 'border-accent/30 bg-accent/5' : 'border-zinc-800'}`}>
            <div className="text-3xl mb-1">{todayWorkout ? '✅' : '⏰'}</div>
            <div className={`font-body font-semibold text-sm ${todayWorkout ? 'text-accent' : 'text-white'}`}>
              {todayWorkout ? 'Treino feito!' : 'Sem treino'}
            </div>
            <div className="text-zinc-500 text-xs mt-0.5">hoje</div>
          </div>
        </div>

        {/* Esta semana */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">Esta semana</span>
            <span className="text-accent font-mono font-semibold text-sm">{weekWorkouts.length}/{profile?.weekly_goal || 3}</span>
          </div>
          <div className="flex justify-between gap-2">
            {weekDays.map((day, i) => {
              const d = format(new Date(weekStart.getTime() + i * 86400000), 'yyyy-MM-dd')
              const done = workedDays.has(d)
              const isToday = d === today
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-zinc-600 text-xs font-body">{day}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    done ? 'bg-accent text-inherit' :
                    isToday ? 'border-2 border-accent/50 text-zinc-500' :
                    'bg-surface2 text-zinc-600'
                  }`}>
                    {done ? '✓' : ''}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3 bg-surface2 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(100, (weekWorkouts.length / (profile?.weekly_goal || 3)) * 100)}%` }} />
          </div>
        </div>

        {/* Quick Check-in */}
        {!todayWorkout && (
          <button onClick={() => navigate('/checkin')} className="btn-primary">
            REGISTRAR TREINO DE HOJE
          </button>
        )}

        {/* Ranking da Semana */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">Ranking da semana</span>
            <button onClick={() => navigate('/rankings')} className="text-accent text-xs font-body font-medium">Ver tudo →</button>
          </div>
          <div className="space-y-2.5">
            {weekRanking.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 ${p.id === profile?.id ? 'opacity-100' : 'opacity-80'}`}>
                <span className="w-6 text-center text-sm">{medals[i] || `${i + 1}`}</span>
                <Avatar profile={p} size="sm" />
                <span className={`flex-1 font-body text-sm ${p.id === profile?.id ? 'text-white font-semibold' : 'text-zinc-300'}`}>
                  {getDisplayName(p, allProfiles)}
                </span>
                <span className="font-mono font-semibold text-sm" style={{ color: p.id === profile?.id ? (p.color || '#B4FF00') : '#888' }}>
                  {p.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
