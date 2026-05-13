import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'

import { getDisplayName } from '../lib/utils'

function getFirstName(name) { return name?.split(' ')[0] || '' }
const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function History() {
  const { profile } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [allWorkouts, setAllWorkouts] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { loadWorkouts() }, [profile])

  async function loadWorkouts() {
    if (!profile) return
    setLoading(true)
    const [workoutsRes, profilesRes] = await Promise.all([
      supabase.from('workouts').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*')
    ])
    setAllWorkouts(workoutsRes.data || [])
    setAllProfiles(profilesRes.data || [])
    setLoading(false)
  }

  function getProfileById(userId) { return allProfiles.find(p => p.id === userId) }

  const myWorkouts = allWorkouts.filter(w => w.user_id === profile?.id)
  const myWorkoutDates = new Set(myWorkouts.map(w => w.date))
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
  const monthWorkouts = myWorkouts.filter(w => w.date >= monthStart && w.date <= monthEnd)
  const monthDays = new Set(monthWorkouts.map(w => w.date)).size
  const selectedDayWorkouts = selectedDay ? allWorkouts.filter(w => w.date === selectedDay) : []
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDayOfWeek = getDay(startOfMonth(currentMonth))
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <Layout>
      <div className="px-5 pb-6 safe-top animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h1 className="page-title">HISTÓRICO</h1>
          <div className="text-right">
            <div className="font-display text-3xl text-accent">{new Set(myWorkouts.map(w => w.date)).size}</div>
            <div className="text-zinc-500 text-xs font-body">dias treinados</div>
          </div>
        </div>

        {/* Calendário */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center text-zinc-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="font-body font-semibold text-white capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              disabled={format(addMonths(currentMonth, 1), 'yyyy-MM') > format(new Date(), 'yyyy-MM')}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 disabled:opacity-30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {WEEK_DAYS.map((d, i) => <div key={i} className="text-center text-zinc-600 text-xs py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={"e"+i} />)}
            {daysInMonth.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const hasMyWorkout = myWorkoutDates.has(dateStr)
              const hasFamilyWorkout = allWorkouts.some(w => w.date === dateStr && w.user_id !== profile?.id)
              const myCount = allWorkouts.filter(w => w.date === dateStr && w.user_id === profile?.id).length
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDay
              return (
                <button key={dateStr} onClick={() => setSelectedDay(selectedDay === dateStr ? null : dateStr)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-body font-medium transition-all relative ${isSelected ? 'ring-2 ring-white' : ''} ${hasMyWorkout ? 'text-inherit' : isToday ? 'border border-accent/50 text-accent' : 'text-zinc-600'}`}
                  style={hasMyWorkout ? { backgroundColor: profile?.color || '#B4FF00' } : {}}>
                  {format(day, 'd')}
                  {myCount > 1 && <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#060606] text-[8px] flex items-center justify-center font-bold">{myCount}</span>}
                  {!hasMyWorkout && hasFamilyWorkout && <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-zinc-500" />}
                </button>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between">
            <div className="text-center">
              <div className="font-display text-2xl text-accent">{monthDays}</div>
              <div className="text-zinc-500 text-xs">dias</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl text-white">{monthWorkouts.length}</div>
              <div className="text-zinc-500 text-xs">sessões</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl text-white">{profile?.weekly_goal || 3}</div>
              <div className="text-zinc-500 text-xs">meta/sem</div>
            </div>
          </div>
        </div>

        {/* Dia selecionado */}
        {selectedDay && (
          <div className="card mb-4 border border-zinc-700">
            <div className="font-body font-semibold text-white text-sm mb-3">
              {format(new Date(selectedDay + 'T12:00:00'), "d 'de' MMMM", { locale: ptBR })}
            </div>
            {selectedDayWorkouts.length === 0 ? (
              <p className="text-zinc-500 text-sm">Ninguém treinou nesse dia.</p>
            ) : (
              <div className="space-y-3">
                {selectedDayWorkouts.map(workout => {
                  const p = getProfileById(workout.user_id)
                  return (
                    <div key={workout.id} className="flex items-start gap-3">
                      {workout.photo_url && (
                        <img src={workout.photo_url} alt="treino" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex items-start gap-2 flex-1">
                        <Avatar profile={p} size="sm" />
                        <div>
                          <div className="font-body font-semibold text-white text-sm">{getDisplayName(p, allProfiles)}</div>
                          <div className="text-zinc-500 text-xs">{workout.notes || 'Treino registrado'}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Lista recente */}
        <div className="section-title mb-3">Últimos treinos da família</div>
        {loading ? (
          <div className="text-center py-8 text-zinc-600">Carregando...</div>
        ) : (
          <div className="space-y-0">
            {allWorkouts.slice(0, 40).map(workout => {
              const p = getProfileById(workout.user_id)
              const isMe = workout.user_id === profile?.id
              return (
                <div key={workout.id} className="flex items-center gap-3 py-3 border-b border-zinc-800 last:border-0">
                  {workout.photo_url ? (
                    <img src={workout.photo_url} alt="treino" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <Avatar profile={p} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-body font-semibold text-sm ${isMe ? 'text-white' : 'text-zinc-300'}`}>
                        {getFirstName(p?.name)}
                      </span>
                      <span className="text-zinc-600 text-xs">
                        {format(new Date(workout.date + 'T12:00:00'), "d MMM", { locale: ptBR })}
                      </span>
                      {workout.date === today && <span className="text-accent text-xs font-mono">hoje</span>}
                    </div>
                    {workout.notes && <div className="text-zinc-500 text-xs mt-0.5 truncate">{workout.notes}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
