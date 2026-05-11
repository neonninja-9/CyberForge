/**
 * CryptoForge — User Progress Data Service
 *
 * All Supabase queries for user stats, algorithm runs,
 * challenge completions, and pipeline data.
 */
import { supabase } from './supabase'


/* ─── User Profile ─── */

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist yet — create it
    const { data: user } = await supabase.auth.getUser()
    const meta = user?.user?.user_metadata || {}
    const { data: newProfile, error: insertErr } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: meta.full_name || meta.name || user?.user?.email?.split('@')[0] || 'User',
        avatar_url: meta.avatar_url || null,
      })
      .select()
      .single()

    if (insertErr) throw insertErr
    return newProfile
  }

  if (error) throw error
  return data
}

export async function updateUserXP(userId, xpToAdd) {
  // Fetch current XP
  const profile = await getUserProfile(userId)
  const newXP = (profile.total_xp || 0) + xpToAdd
  const newLevel = Math.floor(newXP / 500) + 1 // 500 XP per level

  const { error } = await supabase
    .from('user_profiles')
    .update({
      total_xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw error
  return { total_xp: newXP, level: newLevel }
}

export async function updateStreak(userId) {
  const profile = await getUserProfile(userId)
  const today = new Date().toISOString().split('T')[0]
  const lastActive = profile.last_active_date

  let newStreak = profile.streak_days || 0

  if (lastActive !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActive === yesterdayStr) {
      newStreak += 1
    } else {
      newStreak = 1 // streak broken
    }
  }

  const bestStreak = Math.max(newStreak, profile.best_streak || 0)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      streak_days: newStreak,
      best_streak: bestStreak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw error
  return { streak_days: newStreak, best_streak: bestStreak }
}


/* ─── Algorithm Runs ─── */

export async function recordAlgorithmRun(userId, algorithmId, algorithmName, category) {
  // Upsert: increment run_count if exists, insert if not
  const { data: existing } = await supabase
    .from('user_algorithm_runs')
    .select('id, run_count')
    .eq('user_id', userId)
    .eq('algorithm_id', algorithmId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('user_algorithm_runs')
      .update({
        run_count: (existing.run_count || 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('user_algorithm_runs')
      .insert({
        user_id: userId,
        algorithm_id: algorithmId,
        algorithm_name: algorithmName,
        category,
      })
    if (error) throw error
  }

  // Update streak & add XP
  await updateStreak(userId)
  await updateUserXP(userId, 10) // 10 XP per algorithm run
}

export async function getUserAlgorithmRuns(userId) {
  const { data, error } = await supabase
    .from('user_algorithm_runs')
    .select('*')
    .eq('user_id', userId)
    .order('last_run_at', { ascending: false })

  if (error) throw error
  return data || []
}


/* ─── Challenges ─── */

export async function recordChallengeCompletion(userId, challengeId, xpEarned) {
  const { error } = await supabase
    .from('user_challenges')
    .upsert({
      user_id: userId,
      challenge_id: challengeId,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,challenge_id' })

  if (error) throw error

  // Add XP
  if (xpEarned > 0) {
    await updateUserXP(userId, xpEarned)
  }
}

export async function getUserChallenges(userId) {
  const { data, error } = await supabase
    .from('user_challenges')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return data || []
}


/* ─── Pipelines ─── */

export async function getUserPipelines(userId) {
  const { data, error } = await supabase
    .from('user_pipelines')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}


/* ─── Dashboard Aggregate ─── */

export async function getDashboardData(userId) {
  const [profile, algoRuns, challenges, pipelines] = await Promise.all([
    getUserProfile(userId),
    getUserAlgorithmRuns(userId),
    getUserChallenges(userId),
    getUserPipelines(userId),
  ])

  const totalAlgorithms = 28 // total available
  const totalChallenges = 3  // from the challenges route

  return {
    profile,
    stats: {
      algorithmsUsed: algoRuns.length,
      totalAlgorithms,
      totalRuns: algoRuns.reduce((sum, r) => sum + (r.run_count || 0), 0),
      challengesCompleted: challenges.length,
      totalChallenges,
      pipelinesBuilt: pipelines.length,
      streakDays: profile.streak_days || 0,
      bestStreak: profile.best_streak || 0,
    },
    recentActivity: algoRuns.slice(0, 5),
    challenges,
  }
}
