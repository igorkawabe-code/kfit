import { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'

const PERIODS = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'semester', label: 'Semestre' },
  { key: 'year', label: 'Ano' },
]

function getPeriodRange(period) {
  const now = new Date()
  switch (period) {
    case 'week':
      return [format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'), format(endOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd')]
    case 'month':
      return [format(startOfMonth(now), 'yyyy-MM-dd'), format(endOfMonth(now), 'yyyy-MM-dd')]
    case 'semester':
      return [format(subMonths(now, 6), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')]
    case 'year':
      return [format(startOfYear(now), 'yyyy-MM-dd'), format(endOfYear(now), 'yyyy-MM-dd')]
    default:
      return [format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')]
  }
}

import { getDisplayName } from '../lib/utils'

function getFirstName(name) { return name?.split(' ')[0] || '' }

export default function Rankings() {
  const { profile } = useAuth()
  const [period, setPeriod] = useState('week')
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadRanking() }, [period])

  async function loadRanking() {
    setLoading(true)
    const [start, end] = getPeriodRange(period)

    const [profilesRes, workoutsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('workouts').select('user_id').gte('date', start).lte('date', end)
    ])

    const counts = {}
    ;(workoutsRes.data || []).forEach(w => {
      counts[w.user_id] = (counts[w.user_id] || 0) + 1
    })

    const ranked = (profilesRes.data || [])
      .map(p => ({ ...p, count: counts[p.id] || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    setRanking(ranked)
    setLoading(false)
  }

  const maxCount = ranking[0]?.count || 1

  return (
    <Layout>
      <div className="px-5 pb-6 safe-top animate-fade-in">
        {/* Header */}
        <h1 className="page-title mb-5">RANKING</h1>

        {/* Period selector */}
        <div className="flex bg-surface rounded-xl p-1 mb-6 gap-1">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 rounded-lg font-body font-semibold text-sm transition-all ${
                period === p.key ? 'bg-accent text-inherit' : 'text-zinc-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-accent font-display text-xl animate-pulse">CARREGANDO...</div>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {ranking.length > 0 && (
              <div className="mb-6">
                <div className="flex items-end justify-center gap-3 h-40">
                  {/* 2nd */}
                  {ranking[1] && (
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-xl text-inherit"
                        style={{ backgroundColor: ranking[1].color || '#888' }}>
                        {getFirstName(ranking[1].name)?.[0]}
                      </div>
                      <div className="text-zinc-400 font-body text-xs font-semibold">{getDisplayName(ranking[1], ranking)}</div>
                      <div className="w-full bg-surface2 rounded-t-lg flex flex-col items-center justify-end h-20 pb-2 border border-zinc-700">
                        <span className="font-display text-2xl" style={{ color: ranking[1].color || '#888' }}>{ranking[1].count}</span>
                        <span className="text-zinc-500 text-xs">🥈</span>
                      </div>
                    </div>
                  )}
                  {/* 1st */}
                  {ranking[0] && (
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar profile={ranking[0]} size="xl" className="ring-2 ring-accent ring-offset-2 ring-offset-[#060606]" />
                      <div className="text-white font-body text-xs font-bold">{getDisplayName(ranking[0], ranking)}</div>
                      <div className="w-full bg-surface2 rounded-t-lg flex flex-col items-center justify-end h-28 pb-2 border border-accent/30 bg-accent/5">
                        <span className="font-display text-3xl text-accent">{ranking[0].count}</span>
                        <span className="text-zinc-400 text-xs">🥇</span>
                      </div>
                    </div>
                  )}
                  {/* 3rd */}
                  {ranking[2] && (
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-xl text-inherit"
                        style={{ backgroundColor: ranking[2].color || '#CD7F32' }}>
                        {getFirstName(ranking[2].name)?.[0]}
                      </div>
                      <div className="text-zinc-400 font-body text-xs font-semibold">{getDisplayName(ranking[2], ranking)}</div>
                      <div className="w-full bg-surface2 rounded-t-lg flex flex-col items-center justify-end h-14 pb-2 border border-zinc-700">
                        <span className="font-display text-2xl" style={{ color: ranking[2].color || '#CD7F32' }}>{ranking[2].count}</span>
                        <span className="text-zinc-500 text-xs">🥉</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="section-title mb-3">Todos os membros</div>
            <div className="space-y-3">
              {ranking.map((p, i) => (
                <div key={p.id} className={`card flex items-center gap-4 ${p.id === profile?.id ? 'border-zinc-600' : ''}`}>
                  <span className="font-display text-2xl w-8 text-center" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#444' }}>
                    {i + 1}
                  </span>
                  <Avatar profile={p} size="md" />
                  <div className="flex-1">
                    <div className={`font-body font-semibold ${p.id === profile?.id ? 'text-white' : 'text-zinc-300'}`}>
                      {getDisplayName(p, ranking)} {p.id === profile?.id && <span className="text-xs text-zinc-500">(você)</span>}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-1.5 bg-surface2 rounded-full h-1.5 w-full">
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${maxCount > 0 ? (p.count / maxCount) * 100 : 0}%`, backgroundColor: p.color || '#B4FF00' }} />
                    </div>
                  </div>
                  <div className="font-display text-2xl" style={{ color: p.color || '#B4FF00' }}>
                    {p.count}<span className="text-sm text-zinc-500 font-body ml-0.5">x</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
