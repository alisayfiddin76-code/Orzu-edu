<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          📅 Dars Jadvali
        </h1>
        <p class="text-sm text-slate-400 mt-1">Barcha darslar, xonalar va o'qituvchilarning haftalik bandligi</p>
      </div>
      
      <!-- Current Time Indicator -->
      <div class="px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner flex items-center gap-3">
        <div class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <span class="text-sm font-mono font-bold text-slate-300">{{ formattedCurrentTime }}</span>
      </div>
    </div>

    <!-- Filters & Tabs -->
    <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md space-y-5">
      <!-- Tabs -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
          :class="activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="relative">
          <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            v-model="filterTeacher"
            type="text"
            placeholder="O'qituvchi izlash..."
            class="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>
        <div class="relative">
          <Icon name="lucide:door-open" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            v-model="filterRoom"
            type="text"
            placeholder="Xona izlash (masalan: 1-xona)..."
            class="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Status Legend -->
    <div class="flex flex-wrap gap-4 px-2">
      <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span class="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Dars bo'lyapti
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span class="w-3 h-3 rounded-full bg-blue-500 border border-blue-400"></span> Boshlanmadi
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span class="w-3 h-3 rounded-full bg-slate-600 border border-slate-500"></span> Tugagan
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Jadval yuklanmoqda...</p>
    </div>

    <!-- MAIN VIEWS -->
    <div v-else class="space-y-6">

      <!-- DAILY VIEWS (Bugun, Toq, Juft) -->
      <div v-if="activeTab !== 'week'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div v-if="filteredDailyGroups.length === 0" class="col-span-full p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-slate-500">
          Ushbu kunda darslar topilmadi.
        </div>
        
        <!-- Group Card -->
        <div
          v-for="group in filteredDailyGroups"
          :key="group._id"
          class="relative p-5 rounded-2xl border bg-slate-900 shadow-md transition-all duration-300"
          :class="getCardStyle(group).wrapperClass"
        >
          <!-- Status Glow/Indicator for Active classes -->
          <div v-if="getGroupStatus(group) === 'ACTIVE' && activeTab === 'today'" class="absolute -inset-px rounded-2xl border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] pointer-events-none"></div>

          <div class="relative z-10">
            <div class="flex items-start justify-between mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold" :class="getCardStyle(group).timeClass">
                <Icon name="lucide:clock" class="w-3.5 h-3.5" />
                {{ group.start_time }} - {{ group.end_time }}
              </span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ formatDays(group.days) }}</span>
            </div>
            
            <h3 class="text-lg font-bold text-white mb-2 line-clamp-1" :class="{'opacity-70': getGroupStatus(group) === 'ENDED' && activeTab === 'today'}">{{ group.title }}</h3>
            
            <div class="space-y-2 mt-4" :class="{'opacity-70': getGroupStatus(group) === 'ENDED' && activeTab === 'today'}">
              <p class="flex items-center gap-2 text-sm text-slate-300">
                <span class="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Icon name="lucide:user" class="w-3.5 h-3.5" /></span>
                {{ group.teacher?.firstname }} {{ group.teacher?.lastname }}
              </p>
              <p class="flex items-center gap-2 text-sm text-slate-300">
                <span class="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400"><Icon name="lucide:door-open" class="w-3.5 h-3.5" /></span>
                {{ group.room || "Noma'lum" }}
              </p>
              <p class="flex items-center gap-2 text-sm text-slate-300">
                <span class="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400"><Icon name="lucide:users" class="w-3.5 h-3.5" /></span>
                {{ group.students?.length || 0 }} o'quvchi
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- WEEKLY GRID VIEW (Umumiy hafta) -->
      <div v-if="activeTab === 'week'" class="overflow-x-auto pb-4">
        <div class="min-w-[1200px] grid grid-cols-6 gap-4">
          <!-- Weekday Columns -->
          <div v-for="(dayName, index) in weekDays" :key="index" class="flex flex-col gap-3">
            <!-- Column Header -->
            <div class="p-3 text-center rounded-xl bg-slate-900 border border-slate-700/80 sticky top-0 z-20 shadow-md">
              <h3 class="text-sm font-bold text-white tracking-wide uppercase">{{ dayName }}</h3>
            </div>
            
            <!-- Cards in column -->
            <div class="flex-1 space-y-3 rounded-xl bg-slate-950/20 border border-slate-800/30 p-2 min-h-[300px]">
              <div v-if="getGroupsForDay(index + 1).length === 0" class="text-center py-8 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                Dars yo'q
              </div>
              
              <div
                v-for="group in getGroupsForDay(index + 1)"
                :key="group._id"
                class="p-3 rounded-xl border bg-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                :class="getCardStyleForWeek(group, index + 1).wrapperClass"
              >
                <!-- Weekly Card Content (Compact) -->
                <div class="flex justify-between items-start mb-2">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" :class="getCardStyleForWeek(group, index + 1).timeClass">
                    {{ group.start_time }}
                  </span>
                  <span class="text-[10px] font-bold text-slate-500">{{ group.room }}</span>
                </div>
                <h4 class="text-xs font-bold text-white line-clamp-2 leading-tight mb-2">{{ group.title }}</h4>
                <p class="text-[10px] text-slate-400 truncate">{{ group.teacher?.firstname }} {{ group.teacher?.lastname }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Dars Jadvali — ORZU EDU' })

const API = ''

const tabs = [
  { id: 'today', label: 'Bugun' },
  { id: 'odd', label: 'Dush-Chor-Jum (Toq)' },
  { id: 'even', label: 'Sesh-Pay-Shan (Juft)' },
  { id: 'week', label: 'Umumiy hafta' }
]

const weekDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

// State
const loading = ref(true)
const allGroups = ref<any[]>([])
const activeTab = ref('today')
const filterTeacher = ref('')
const filterRoom = ref('')

// Time tracking for status
const currentTimeMinutes = ref(0)
const formattedCurrentTime = ref('')
let timerInterval: any = null

const updateTime = () => {
  const now = new Date()
  currentTimeMinutes.value = now.getHours() * 60 + now.getMinutes()
  formattedCurrentTime.value = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  timerInterval = setInterval(updateTime, 60000) // update every minute
  
  // Set initial tab if today is Sunday, default to 'week' instead of empty 'today'
  const todayNum = new Date().getDay()
  if (todayNum === 0) activeTab.value = 'week'
  
  fetchGroups()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const fetchGroups = async () => {
  try {
    const token = useCookie("auth_token")
    if (!token.value) return
    const { data }: any = await $fetch(`${API}/api/v1/groups`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    // Guruhlarni olamiz
    allGroups.value = data?.groups || []
  } catch (err) {
    console.error("Guruhlarni yuklashda xatolik:", err)
  } finally {
    loading.value = false
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

const parseTime = (timeStr: string) => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

const formatDays = (days: string): string => {
  if (!days) return ""
  const map: Record<string, string> = {
    'ODD': 'Duy, Chor, Jum',
    'EVEN': 'Se, Pay, Shan',
    'EVERYDAY': 'Har kuni',
    'CUSTOM': 'Maxsus jadval'
  }
  return map[days] || days
}

// Holatni hisoblash (Faqat "Bugun" tabida yoki haqiqiy shu kuni ishlaydi)
const getGroupStatus = (group: any, forceCurrentDay = true) => {
  if (!forceCurrentDay) return 'UPCOMING'
  
  const start = parseTime(group.start_time)
  const end = parseTime(group.end_time)
  const current = currentTimeMinutes.value
  
  if (current >= start && current <= end) return 'ACTIVE'
  if (current > end) return 'ENDED'
  return 'UPCOMING'
}

// Karta dizayni (Holatga qarab)
const getCardStyle = (group: any) => {
  const status = getGroupStatus(group, activeTab.value === 'today')
  if (status === 'ACTIVE') {
    return {
      wrapperClass: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20',
      timeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
    }
  }
  if (status === 'UPCOMING') {
    return {
      wrapperClass: 'border-blue-500/30',
      timeClass: 'bg-blue-500/20 text-blue-400'
    }
  }
  // ENDED
  return {
    wrapperClass: 'border-slate-800 opacity-60',
    timeClass: 'bg-slate-800 text-slate-400'
  }
}

// Haftalik grid uchun kichik karta dizayni
const getCardStyleForWeek = (group: any, columnDayIndex: number) => {
  const todayIndex = new Date().getDay()
  const status = getGroupStatus(group, columnDayIndex === todayIndex)
  
  if (status === 'ACTIVE') return { wrapperClass: 'border-emerald-500/50', timeClass: 'bg-emerald-500/20 text-emerald-400' }
  if (status === 'UPCOMING') return { wrapperClass: 'border-slate-700 hover:border-blue-500/50', timeClass: 'bg-blue-500/10 text-blue-400' }
  return { wrapperClass: 'border-slate-800 opacity-50', timeClass: 'bg-slate-800 text-slate-400' }
}

// ─── Filtering Logic ───────────────────────────────────────────────

const filterByText = (group: any) => {
  const t = filterTeacher.value.toLowerCase().trim()
  const r = filterRoom.value.toLowerCase().trim()
  
  let match = true
  if (t) {
    const teacherName = `${group.teacher?.firstname || ''} ${group.teacher?.lastname || ''}`.toLowerCase()
    if (!teacherName.includes(t)) match = false
  }
  if (r) {
    const roomName = (group.room || '').toLowerCase()
    if (!roomName.includes(r)) match = false
  }
  return match
}

// Bugungi kun logic
const isGroupToday = (group: any) => {
  const todayNum = new Date().getDay() // 0=Sun, 1=Mon ... 6=Sat
  if (todayNum === 0) return false // Sunday has no standard classes usually
  
  const days = group.days || ''
  if (days === 'EVERYDAY') return true
  
  const isOddDay = todayNum === 1 || todayNum === 3 || todayNum === 5
  if (isOddDay && days === 'ODD') return true
  
  const isEvenDay = todayNum === 2 || todayNum === 4 || todayNum === 6
  if (isEvenDay && days === 'EVEN') return true
  
  return false
}

const filteredDailyGroups = computed(() => {
  let filtered = allGroups.value.filter(filterByText)
  
  if (activeTab.value === 'today') {
    filtered = filtered.filter(isGroupToday)
  } else if (activeTab.value === 'odd') {
    filtered = filtered.filter(g => g.days === 'ODD' || g.days === 'EVERYDAY')
  } else if (activeTab.value === 'even') {
    filtered = filtered.filter(g => g.days === 'EVEN' || g.days === 'EVERYDAY')
  }
  
  // Sort by start_time
  return filtered.sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time))
})

// Haftalik jadval uchun ma'lum bir kunga tegishli guruhlarni olish
const getGroupsForDay = (dayIndex: number) => {
  // dayIndex: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  let filtered = allGroups.value.filter(filterByText)
  
  filtered = filtered.filter(group => {
    const d = group.days || ''
    if (d === 'EVERYDAY') return true
    
    const isOddCol = dayIndex === 1 || dayIndex === 3 || dayIndex === 5
    if (isOddCol && d === 'ODD') return true
    
    const isEvenCol = dayIndex === 2 || dayIndex === 4 || dayIndex === 6
    if (isEvenCol && d === 'EVEN') return true
    
    return false
  })
  
  return filtered.sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time))
}

</script>
