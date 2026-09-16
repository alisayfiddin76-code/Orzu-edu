<template>
  <div class="space-y-6">

    <!-- ── Header ────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">🏆 Oyning eng yaxshilari</h1>
        <p class="text-sm text-slate-400 mt-1">
          Avtomatik reyting — davomat, baholar va uy vazifalari asosida
        </p>
      </div>
      <!-- Controls -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Period -->
        <div class="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-sm font-semibold">
          <button
            v-for="p in periods" :key="p.value"
            @click="period = p.value"
            :class="['px-4 py-2 transition-colors', period === p.value ? 'bg-[#F2C230] text-[#082F49]' : 'text-slate-400 hover:text-white']"
          >{{ p.label }}</button>
        </div>
        <!-- Limit -->
        <select
          v-model="limit"
          class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F2C230]"
        >
          <option value="3">Top 3</option>
          <option value="5">Top 5</option>
          <option value="10">Top 10</option>
        </select>
        <!-- Tab: O'quvchilar / O'qituvchilar -->
        <div class="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-sm font-semibold">
          <button
            @click="tab = 'students'"
            :class="['px-4 py-2 transition-colors', tab === 'students' ? 'bg-[#082F49] text-[#F2C230]' : 'text-slate-400 hover:text-white']"
          >🎓 O'quvchilar</button>
          <button
            @click="tab = 'teachers'"
            :class="['px-4 py-2 transition-colors', tab === 'teachers' ? 'bg-[#082F49] text-[#F2C230]' : 'text-slate-400 hover:text-white']"
          >👨‍🏫 O'qituvchilar</button>
        </div>
      </div>
    </div>

    <!-- ── Info bar ───────────────────────────────── -->
    <div v-if="data" class="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2">
      <Icon name="lucide:info" class="w-3.5 h-3.5 text-[#F2C230]" />
      <span>
        <span class="text-slate-300 font-semibold">{{ data.periodLabel }}</span> davri uchun avtomatik hisoblangan.
        Yangilangan: {{ formatTime(data.generatedAt) }}
      </span>
    </div>

    <!-- ── Loading Skeleton ───────────────────────── -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in Number(limit)" :key="i" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-full bg-slate-800"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-800 rounded w-3/4"></div>
            <div class="h-3 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
        <div class="space-y-3">
          <div class="h-2 bg-slate-800 rounded-full"></div>
          <div class="h-2 bg-slate-800 rounded-full w-4/5"></div>
          <div class="h-2 bg-slate-800 rounded-full w-3/5"></div>
        </div>
      </div>
    </div>

    <!-- ── Error ─────────────────────────────────── -->
    <div v-else-if="error" class="flex items-center gap-3 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
      <Icon name="lucide:alert-circle" class="w-5 h-5 flex-shrink-0" />
      <div>
        <p class="font-semibold">Ma'lumotlarni yuklab bo'lmadi</p>
        <p class="text-sm opacity-80 mt-0.5">{{ error }}</p>
      </div>
    </div>

    <!-- ── Empty ─────────────────────────────────── -->
    <div v-else-if="!loading && rankings.length === 0" class="text-center py-20 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
      <span class="text-5xl block mb-4">📊</span>
      <p class="text-slate-400 font-medium">Ushbu davr uchun ma'lumot mavjud emas</p>
      <p class="text-sm text-slate-600 mt-1">Davomat, baholar yoki uy vazifalari kiritilganda reyting avtomatik yangilanadi</p>
    </div>

    <!-- ── Top-3 Podium ───────────────────────────── -->
    <div v-else>
      <!-- Podium (top 3 bor bo'lsa) -->
      <div v-if="rankings.length >= 3" class="flex items-end justify-center gap-4 mb-8 px-4">

        <!-- 2nd place -->
        <div class="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
          <div class="relative">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-500 bg-slate-800 flex items-center justify-center">
              <img v-if="rankings[1].student?.photo" :src="rankings[1].student.photo" class="w-full h-full object-cover" />
              <span v-else class="text-xl font-black text-slate-400">{{ initials(rankings[1]) }}</span>
            </div>
            <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 text-slate-900 text-xs font-black flex items-center justify-center border-2 border-slate-950">2</span>
          </div>
          <div class="text-center">
            <p class="text-sm font-bold text-white leading-tight">{{ fullName(rankings[1]) }}</p>
            <p class="text-xs text-slate-400">{{ rankings[1].group || rankings[1].course || '—' }}</p>
          </div>
          <div class="w-full bg-slate-600 rounded-t-xl flex items-end justify-center" style="height:80px">
            <span class="mb-2 text-lg font-black text-slate-300">🥈</span>
          </div>
          <span class="text-sm font-black text-slate-300">{{ rankings[1].scores.total }} ball</span>
        </div>

        <!-- 1st place -->
        <div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
          <div class="relative">
            <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-[#F2C230] bg-slate-800 flex items-center justify-center shadow-lg shadow-[#F2C230]/20">
              <img v-if="rankings[0].student?.photo" :src="rankings[0].student.photo" class="w-full h-full object-cover" />
              <span v-else class="text-2xl font-black text-[#F2C230]">{{ initials(rankings[0]) }}</span>
            </div>
            <span class="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">👑</span>
            <span class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#F2C230] text-[#082F49] text-sm font-black flex items-center justify-center border-2 border-slate-950">1</span>
          </div>
          <div class="text-center">
            <p class="text-base font-black text-white leading-tight">{{ fullName(rankings[0]) }}</p>
            <p class="text-xs text-[#F2C230]">{{ rankings[0].group || rankings[0].course || '—' }}</p>
          </div>
          <div class="w-full bg-[#F2C230]/20 border border-[#F2C230]/30 rounded-t-xl flex items-end justify-center" style="height:110px">
            <span class="mb-2 text-2xl">🥇</span>
          </div>
          <span class="text-base font-black text-[#F2C230]">{{ rankings[0].scores.total }} ball</span>
        </div>

        <!-- 3rd place -->
        <div class="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
          <div class="relative">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-700 bg-slate-800 flex items-center justify-center">
              <img v-if="rankings[2].student?.photo" :src="rankings[2].student.photo" class="w-full h-full object-cover" />
              <span v-else class="text-xl font-black text-amber-700">{{ initials(rankings[2]) }}</span>
            </div>
            <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-amber-100 text-xs font-black flex items-center justify-center border-2 border-slate-950">3</span>
          </div>
          <div class="text-center">
            <p class="text-sm font-bold text-white leading-tight">{{ fullName(rankings[2]) }}</p>
            <p class="text-xs text-slate-400">{{ rankings[2].group || rankings[2].course || '—' }}</p>
          </div>
          <div class="w-full bg-amber-800/40 rounded-t-xl flex items-end justify-center" style="height:60px">
            <span class="mb-2 text-lg font-black text-amber-700">🥉</span>
          </div>
          <span class="text-sm font-black text-amber-600">{{ rankings[2].scores.total }} ball</span>
        </div>

      </div>

      <!-- ── Full Rankings List ───────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="item in rankings"
          :key="item.student?._id || item.teacher?._id"
          class="group relative bg-slate-900 border rounded-2xl p-5 transition-all hover:border-[#F2C230]/30 hover:shadow-lg hover:shadow-[#F2C230]/5"
          :class="rankBorderClass(item.rank)"
        >
          <!-- Rank badge -->
          <div class="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-slate-950 shadow"
               :class="rankBadgeClass(item.rank)">
            {{ item.rank <= 3 ? ['🥇','🥈','🥉'][item.rank-1] : item.rank }}
          </div>

          <!-- Person info -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-black border"
                 :class="rankAvatarClass(item.rank)">
              <img
                v-if="(item.student?.photo || item.teacher?.photo)"
                :src="item.student?.photo || item.teacher?.photo"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ initials(item) }}</span>
            </div>
            <div class="min-w-0">
              <p class="font-bold text-white truncate">{{ fullName(item) }}</p>
              <p class="text-xs text-slate-400 truncate mt-0.5">
                {{ item.group || item.course || (item.groupCount ? `${item.groupCount} ta guruh` : '—') }}
              </p>
            </div>
            <div class="ml-auto text-right flex-shrink-0">
              <p class="text-xl font-black" :class="item.rank === 1 ? 'text-[#F2C230]' : 'text-white'">{{ item.scores.total }}</p>
              <p class="text-[10px] text-slate-500">/ 100 ball</p>
            </div>
          </div>

          <!-- Progress bars -->
          <div class="space-y-2.5">
            <!-- Davomat -->
            <div>
              <div class="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                <span>📅 Davomat</span>
                <span>{{ item.scores.attendance }} / 40</span>
              </div>
              <div class="h-1.5 rounded-full bg-slate-800">
                <div class="h-full rounded-full bg-emerald-500 transition-all" :style="`width:${(item.scores.attendance/40)*100}%`"></div>
              </div>
            </div>
            <!-- Baholar -->
            <div>
              <div class="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                <span>📝 Baholar</span>
                <span>{{ item.scores.grades }} / 35</span>
              </div>
              <div class="h-1.5 rounded-full bg-slate-800">
                <div class="h-full rounded-full bg-blue-500 transition-all" :style="`width:${(item.scores.grades/35)*100}%`"></div>
              </div>
            </div>
            <!-- Uy vazifalari -->
            <div>
              <div class="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                <span>🏠 Uy vazifalari</span>
                <span>{{ item.scores.homework }} / 25</span>
              </div>
              <div class="h-1.5 rounded-full bg-slate-800">
                <div class="h-full rounded-full bg-violet-500 transition-all" :style="`width:${(item.scores.homework/25)*100}%`"></div>
              </div>
            </div>
          </div>

          <!-- Total bar -->
          <div class="mt-3 pt-3 border-t border-slate-800">
            <div class="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="item.rank === 1 ? 'bg-gradient-to-r from-[#F2C230] to-[#D9A404]' : 'bg-gradient-to-r from-slate-500 to-slate-400'"
                :style="`width:${item.scores.total}%`"
              ></div>
            </div>
          </div>

          <!-- Meta info (o'quvchilar uchun) -->
          <div v-if="item.meta && tab === 'students'" class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div class="bg-slate-800/60 rounded-lg px-2 py-1.5">
              <p class="text-xs font-black text-white">{{ item.meta.attendancePct != null ? item.meta.attendancePct + '%' : '—' }}</p>
              <p class="text-[9px] text-slate-500">Keldi</p>
            </div>
            <div class="bg-slate-800/60 rounded-lg px-2 py-1.5">
              <p class="text-xs font-black text-white">{{ item.meta.avgGrade != null ? item.meta.avgGrade : '—' }}</p>
              <p class="text-[9px] text-slate-500">O'rtacha baho</p>
            </div>
            <div class="bg-slate-800/60 rounded-lg px-2 py-1.5">
              <p class="text-xs font-black text-white">{{ item.meta.hwPct != null ? item.meta.hwPct + '%' : '—' }}</p>
              <p class="text-[9px] text-slate-500">Vazifalar</p>
            </div>
          </div>
          <!-- Meta info (o'qituvchilar uchun) -->
          <div v-else-if="tab === 'teachers'" class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div class="bg-slate-800/60 rounded-lg px-2 py-1.5">
              <p class="text-xs font-black text-white">{{ item.groupCount }}</p>
              <p class="text-[9px] text-slate-500">Guruhlar</p>
            </div>
            <div class="bg-slate-800/60 rounded-lg px-2 py-1.5">
              <p class="text-xs font-black text-white">{{ item.studentCount }}</p>
              <p class="text-[9px] text-slate-500">O'quvchilar</p>
            </div>
            <div class="bg-slate-800/60 rounded-lg px-2 py-1.5">
              <p class="text-xs font-black" :class="item.hasActivity ? 'text-emerald-400' : 'text-slate-500'">
                {{ item.hasActivity ? 'Mavjud' : 'Yo\'q' }}
              </p>
              <p class="text-[9px] text-slate-500">Faoliyat</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Oyning Eng Yaxshilari — ORZU EDU' })

// ── State ────────────────────────────────────────────
const tab    = ref<'students'|'teachers'>('students')
const period = ref('month')
const limit  = ref('10')
const loading = ref(false)
const error   = ref('')
const data    = ref<any>(null)

const periods = [
  { label: 'Bu oy',   value: 'month' },
  { label: 'Bu hafta', value: 'week'  },
]

const rankings = computed(() => data.value?.rankings ?? [])

// ── Fetch ─────────────────────────────────────────────
const fetchRankings = async () => {
  loading.value = true
  error.value   = ''
  data.value    = null
  try {
    const token   = useCookie('auth_token')
    const endpoint = tab.value === 'teachers'
      ? `/api/v1/student-of-month/teachers?period=${period.value}&limit=${limit.value}`
      : `/api/v1/student-of-month?period=${period.value}&limit=${limit.value}`

    const res = await $fetch<any>(endpoint, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    data.value = res.data
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Ma\'lumot yuklab bo\'lmadi'
  } finally {
    loading.value = false
  }
}

watch([tab, period, limit], fetchRankings, { immediate: true })

// ── Helpers ───────────────────────────────────────────
const fullName = (item: any) => {
  const person = item.student || item.teacher
  if (!person) return '—'
  return `${person.firstname || ''} ${person.lastname || ''}`.trim() || '—'
}

const initials = (item: any) => {
  const name = fullName(item)
  return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '?'
}

const formatTime = (dt: string) => {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

const rankBorderClass = (rank: number) => {
  if (rank === 1) return 'border-[#F2C230]/40'
  if (rank === 2) return 'border-slate-500/40'
  if (rank === 3) return 'border-amber-700/40'
  return 'border-slate-800'
}

const rankBadgeClass = (rank: number) => {
  if (rank === 1) return 'bg-[#F2C230] text-[#082F49]'
  if (rank === 2) return 'bg-slate-500 text-white'
  if (rank === 3) return 'bg-amber-700 text-white'
  return 'bg-slate-800 text-slate-300'
}

const rankAvatarClass = (rank: number) => {
  if (rank === 1) return 'border-[#F2C230] text-[#F2C230]'
  if (rank === 2) return 'border-slate-500 text-slate-400'
  if (rank === 3) return 'border-amber-700 text-amber-600'
  return 'border-slate-700 text-slate-400'
}
</script>
