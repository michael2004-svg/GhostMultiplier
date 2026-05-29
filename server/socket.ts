import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from '@supabase/supabase-js'
import {
  generateRoundOutcome,
  generateServerSeed,
  generateClientSeed,
  hashSeeds,
  getMultiplierAtTime,
} from '../lib/rng'
import { PHASE_DURATIONS } from '../lib/gameEngine'
import type { Phase, Color } from '../types/game'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

let roundNumber = 0
let currentRoundId: string | null = null
let currentPhase: Phase = 'IDLE'
let playerCount = 0
let multiplierInterval: NodeJS.Timeout | null = null
let phaseTimeout: NodeJS.Timeout | null = null

// Precomputed outcome for current round
let roundOutcome: { color: Color; multiplier: number } | null = null
let serverSeed: string = ''
let clientSeed: string = ''

async function createRound() {
  roundNumber++
  serverSeed = generateServerSeed()
  clientSeed = generateClientSeed()
  const hash = hashSeeds(serverSeed, clientSeed)
  roundOutcome = generateRoundOutcome(serverSeed, clientSeed, String(roundNumber))

  const { data: round } = await supabase
    .from('rounds')
    .insert({
      round_number: roundNumber,
      server_seed: serverSeed,
      client_seed: clientSeed,
      hash,
      phase: 'BETTING',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  return round
}

async function updateRoundPhase(roundId: string, phase: Phase, extra?: object) {
  await supabase
    .from('rounds')
    .update({ phase, ...extra })
    .eq('id', roundId)
}

async function resolveRound(roundId: string) {
  if (!roundOutcome) return

  // Get all bets for this round
  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('round_id', roundId)
    .is('cashout_at', null) // only unresolved

  if (!bets) return

  for (const bet of bets) {
    let outcome: string
    let profit: number

    if (roundOutcome.color === 'JOKER') {
      outcome = 'JOKER'
      profit = -bet.amount
    } else if (bet.color_choice === roundOutcome.color) {
      const payout = Math.floor(bet.amount * roundOutcome.multiplier)
      profit = payout - bet.amount
      outcome = 'WIN'
      await supabase.rpc('increment_balance', { user_id: bet.user_id, amount: payout })
      await supabase.rpc('add_xp', { user_id: bet.user_id, xp: 50 })
    } else {
      outcome = 'LOSS'
      profit = -bet.amount
    }

    await supabase
      .from('bets')
      .update({ outcome, profit })
      .eq('id', bet.id)

    // Emit feed update
    const { data: user } = await supabase
      .from('users')
      .select('username, avatar_url, vip_level')
      .eq('id', bet.user_id)
      .single()

    io.emit('feed:update', {
      userId: bet.user_id,
      username: user?.username ?? 'Player',
      avatarUrl: user?.avatar_url,
      vipLevel: user?.vip_level,
      action: outcome === 'WIN' ? 'WIN' : outcome === 'LOSS' ? 'LOSS' : 'LOSS',
      amount: bet.amount,
      color: bet.color_choice,
      profit,
      timestamp: Date.now(),
    })
  }

  // Update round outcome
  await supabase
    .from('rounds')
    .update({
      outcome_color: roundOutcome.color,
      crash_multiplier: roundOutcome.multiplier,
      ended_at: new Date().toISOString(),
      phase: 'RESOLUTION',
      server_seed: serverSeed, // reveal server seed
    })
    .eq('id', roundId)
}

function clearTimers() {
  if (multiplierInterval) { clearInterval(multiplierInterval); multiplierInterval = null }
  if (phaseTimeout) { clearTimeout(phaseTimeout); phaseTimeout = null }
}

async function runBettingPhase(roundId: string) {
  currentPhase = 'BETTING'
  const endsAt = Date.now() + PHASE_DURATIONS.BETTING

  io.emit('round:phase', { phase: 'BETTING', phaseEndsAt: endsAt })

  phaseTimeout = setTimeout(() => runMultiplierPhase(roundId), PHASE_DURATIONS.BETTING)
}

async function runMultiplierPhase(roundId: string) {
  currentPhase = 'MULTIPLIER'
  const endsAt = Date.now() + PHASE_DURATIONS.MULTIPLIER
  const startTime = Date.now()
  const maxMult = roundOutcome?.multiplier ?? 2

  await updateRoundPhase(roundId, 'MULTIPLIER')
  io.emit('round:phase', { phase: 'MULTIPLIER', phaseEndsAt: endsAt, maxMultiplier: maxMult })

  // Emit multiplier ticks every 100ms
  multiplierInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const value = getMultiplierAtTime(elapsed, maxMult)
    io.emit('round:multiplier', { value, timestamp: Date.now() })
  }, 100)

  phaseTimeout = setTimeout(() => {
    if (multiplierInterval) clearInterval(multiplierInterval)
    runLockPhase(roundId)
  }, PHASE_DURATIONS.MULTIPLIER)
}

async function runLockPhase(roundId: string) {
  currentPhase = 'LOCK'
  const endsAt = Date.now() + PHASE_DURATIONS.LOCK

  await updateRoundPhase(roundId, 'LOCK')
  io.emit('round:phase', { phase: 'LOCK', phaseEndsAt: endsAt })

  phaseTimeout = setTimeout(() => runFlipPhase(roundId), PHASE_DURATIONS.LOCK)
}

async function runFlipPhase(roundId: string) {
  currentPhase = 'FLIP'
  const endsAt = Date.now() + PHASE_DURATIONS.FLIP

  await updateRoundPhase(roundId, 'FLIP')
  io.emit('round:phase', { phase: 'FLIP', phaseEndsAt: endsAt })

  // Reveal the card
  io.emit('round:flip', {
    color: roundOutcome?.color,
    serverSeed,
    winningSide: roundOutcome?.color,
  })

  phaseTimeout = setTimeout(() => runResolutionPhase(roundId), PHASE_DURATIONS.FLIP)
}

async function runResolutionPhase(roundId: string) {
  currentPhase = 'RESOLUTION'
  const endsAt = Date.now() + PHASE_DURATIONS.RESOLUTION

  await updateRoundPhase(roundId, 'RESOLUTION')
  await resolveRound(roundId)

  io.emit('round:phase', { phase: 'RESOLUTION', phaseEndsAt: endsAt })
  io.emit('round:end', {
    outcome: roundOutcome,
    nextRoundIn: PHASE_DURATIONS.RESOLUTION,
  })

  phaseTimeout = setTimeout(() => startNewRound(), PHASE_DURATIONS.RESOLUTION)
}

async function startNewRound() {
  clearTimers()
  const round = await createRound()
  if (!round) return

  currentRoundId = round.id
  const bettingEndsAt = Date.now() + PHASE_DURATIONS.BETTING

  io.emit('round:start', {
    roundId: round.id,
    roundNumber: round.round_number,
    hash: round.hash,
    phase: 'BETTING',
    phaseEndsAt: bettingEndsAt,
    maxMultiplier: roundOutcome?.multiplier ?? 2,
  })

  await runBettingPhase(round.id)
}

// Socket connection handlers
io.on('connection', (socket) => {
  playerCount++
  io.emit('players:count', { count: playerCount })

  // Send current round state to new connection
  if (currentRoundId) {
    socket.emit('round:phase', {
      phase: currentPhase,
      phaseEndsAt: Date.now(),
    })
  }

  socket.on('join:game', ({ userId }: { userId: string }) => {
    socket.data.userId = userId
    socket.join(`user:${userId}`)
  })

  socket.on('leave:game', ({ userId }: { userId: string }) => {
    socket.leave(`user:${userId}`)
  })

  socket.on('bet:place', async (data: {
    roundId: string
    userId: string
    amount: number
    colorChoice: 'RED' | 'BLACK'
  }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bets/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok) {
        // Broadcast to feed
        const { data: user } = await supabase
          .from('users')
          .select('username, avatar_url, vip_level')
          .eq('id', data.userId)
          .single()

        io.emit('feed:update', {
          userId: data.userId,
          username: user?.username ?? 'Player',
          avatarUrl: user?.avatar_url,
          vipLevel: user?.vip_level,
          action: 'BET',
          amount: data.amount,
          color: data.colorChoice,
          timestamp: Date.now(),
        })

        socket.emit('bet:confirmed', result.bet)
      } else {
        socket.emit('bet:error', { message: result.error })
      }
    } catch (err) {
      socket.emit('bet:error', { message: 'Bet failed' })
    }
  })

  socket.on('bet:cashout', async (data: {
    roundId: string
    userId: string
    currentMultiplier: number
  }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bets/cashout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok) {
        const { data: user } = await supabase
          .from('users')
          .select('username, avatar_url, vip_level')
          .eq('id', data.userId)
          .single()

        io.emit('feed:update', {
          userId: data.userId,
          username: user?.username ?? 'Player',
          avatarUrl: user?.avatar_url,
          vipLevel: user?.vip_level,
          action: 'CASHOUT',
          amount: result.cashoutAmount,
          multiplier: result.multiplier,
          profit: result.cashoutAmount - data.currentMultiplier,
          timestamp: Date.now(),
        })

        socket.emit('cashout:confirmed', result)
      } else {
        socket.emit('cashout:error', { message: result.error })
      }
    } catch (err) {
      socket.emit('cashout:error', { message: 'Cashout failed' })
    }
  })

  socket.on('token:use', async (data: {
    roundId: string
    userId: string
    tokenType: 'PEEK' | 'SHIELD' | 'DOUBLE_DOWN'
  }) => {
    const costs: Record<string, number> = { PEEK: 5, SHIELD: 10, DOUBLE_DOWN: 20 }
    const cost = costs[data.tokenType] ?? 0

    await supabase.rpc('decrement_balance', { user_id: data.userId, amount: cost })
    await supabase.from('token_purchases').insert({
      user_id: data.userId,
      round_id: data.roundId,
      token_type: data.tokenType,
      cost,
    })

    socket.emit('token:used', { tokenType: data.tokenType, cost })
  })

  socket.on('disconnect', () => {
    playerCount = Math.max(0, playerCount - 1)
    io.emit('players:count', { count: playerCount })
  })
})

// Start the game loop
const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
  startNewRound()
})