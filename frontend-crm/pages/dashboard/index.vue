<template>
  <div class="space-y-6">

    <!-- Student Profile Modal -->
    <StudentProfileModal v-model="showProfileModal" :studentId="selectedProfileStudentId" />

    <!-- Welcome Header & Quick Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 flex-1 shadow-xl">
        <h2 class="text-2xl font-bold tracking-tight text-white">Xush kelibsiz, Admin! 👋</h2>
        <p class="text-sm text-slate-400 mt-1">{{ today }} | ORZU EDU boshqaruv paneli</p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/dashboard/students" class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2">
          <Icon name="lucide:user-plus" class="w-4 h-4" /> O'quvchi qo'shish
        </NuxtLink>
        <NuxtLink to="/dashboard/leads" class="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2">
          <Icon name="lucide:user-plus-2" class="w-4 h-4" /> Lid qo'shish
        </NuxtLink>
        <NuxtLink to="/dashboard/finance" class="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/20 transition flex items-center gap-2">
          <Icon name="lucide:wallet" class="w-4 h-4" /> To'lov qabul qilish
        </NuxtLink>
      </div>
    </div>

    <!-- =========  UNREAD MESSAGES ALERT ========= -->
    <div 
      v-if="unreadMessages > 0"
      class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg">✉</span>
        <span>Sizda <strong class="text-white">{{ unreadMessages }}</strong> ta yangi o'qilmagan mijoz murojaatlari mavjud!</span>
      </div>
      <NuxtLink to="/dashboard/messages" class="text-xs bg-indigo-600 hover:bg-indigo-550 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
        Xabarlarni o'qish →
      </NuxtLink>
    </div>

    <!-- =========  ANALYTICS STATS ========= -->
    <div v-if="loadingStats" class="py-8 text-center text-slate-400">Statistika yuklanmoqda...</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div
        v-for="stat in dynamicStats"
        :key="stat.label"
        class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors flex justify-between items-center group relative overflow-hidden"
      >
        <div :class="`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.color}`"></div>
        <div class="relative z-10">
          <p class="text-[11px] text-slate-500 uppercase tracking-widest font-bold">{{ stat.label }}</p>
          <div class="flex items-baseline gap-2 mt-1.5">
            <p class="text-2xl font-black text-white" :class="stat.textClass">{{ stat.value }}</p>
            <p v-if="stat.trend" class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900/50" :class="stat.trendColor">{{ stat.trend }}</p>
          </div>
        </div>
        <div class="relative z-10 w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
          <Icon :name="stat.icon" :class="`w-6 h-6 ${stat.iconClass}`" />
        </div>
      </div>
    </div>

    <!-- =========  ABSENT STUDENTS ALERT ========= -->
    <div
      v-if="!loadingStats"
      class="p-4 rounded-2xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
      :class="absenteeCount === 0
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : absenteeCount >= 5 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          :class="absenteeCount === 0 ? 'bg-emerald-500/20' : absenteeCount >= 5 ? 'bg-rose-500/20' : 'bg-amber-500/20'"
        >
          <Icon
            :name="absenteeCount === 0 ? 'lucide:user-check' : 'lucide:user-x'"
            class="w-5 h-5"
            :class="absenteeCount === 0 ? 'text-emerald-400' : absenteeCount >= 5 ? 'text-rose-400' : 'text-amber-400'"
          />
        </div>
        <div>
          <p class="text-sm font-bold text-white">So'nggi 30 kunda dars qoldirganlar</p>
          <p class="text-xs mt-0.5"
            :class="absenteeCount === 0 ? 'text-emerald-400' : 'text-slate-400'"
          >
            {{ absenteeCount === 0 ? '✅ Hamma o\'quvchi darsga qatnashmoqda' : `2+ marta kelmagan o'quvchilar mavjud` }}
          </p>
        </div>
      </div>

      <!-- 0 bo'lsa button ko'rsatmaylik -->
      <button
        v-if="absenteeCount > 0"
        @click="showAbsenteeModal = true"
        class="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
        :class="absenteeCount >= 5 ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'"
      >
        <span class="text-2xl font-black" :class="absenteeCount >= 5 ? 'text-rose-400' : 'text-amber-400'">{{ absenteeCount }}</span>
        <span>o'quvchi → Ko'rish</span>
      </button>

      <!-- 0 bo'lsa yashil badge -->
      <div v-else class="shrink-0 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-bold">
        Hammasi yaxshi ✓
      </div>
    </div>

    <!-- =========  CHARTS SECTION ========= -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-if="!loadingStats">
      
      <!-- Revenue Chart -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md">
        <div class="mb-4">
          <h3 class="text-md font-bold tracking-tight text-white flex items-center gap-2">
            <Icon name="lucide:bar-chart-3" class="w-5 h-5 text-indigo-400" />
            Tushumlar Solishtirmasi
          </h3>
          <p class="text-xs text-slate-500">O'tgan oy va Joriy oy</p>
        </div>
        <div class="h-64 flex items-center justify-center">
          <Bar v-if="revenueChartData" :data="revenueChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Course Demand Chart -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md">
        <div class="mb-4">
          <h3 class="text-md font-bold tracking-tight text-white flex items-center gap-2">
            <Icon name="lucide:pie-chart" class="w-5 h-5 text-indigo-400" />
            Kurslarga Talab
          </h3>
          <p class="text-xs text-slate-500">O'quvchilarning kurslar kesimida taqsimoti</p>
        </div>
        <div class="h-64 flex items-center justify-center">
          <Doughnut v-if="courseDemandData" :data="courseDemandData" :options="doughnutOptions" />
        </div>
      </div>

      <!-- Lead Sources Chart -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md">
        <div class="mb-4">
          <h3 class="text-md font-bold tracking-tight text-white flex items-center gap-2">
            <Icon name="lucide:magnet" class="w-5 h-5 text-indigo-400" />
            Bizni qayerdan topishdi?
          </h3>
          <p class="text-xs text-slate-500">Lidlar va O'quvchilarning manbalari (foizda)</p>
        </div>
        <div class="h-64 flex items-center justify-center">
          <Doughnut v-if="leadSourcesData" :data="leadSourcesData" :options="doughnutOptions" />
        </div>
      </div>

    </div>

    <!-- =========  LOWER SECTION (SCHEDULE & LEADS) ========= -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Today's Schedule -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md flex flex-col h-full">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-md font-bold tracking-tight text-white flex items-center gap-2">
              <Icon name="lucide:calendar-clock" class="w-5 h-5 text-indigo-400" />
              Bugungi Darslar
            </h3>
            <p class="text-xs text-slate-500">Guruhlar ro'yxati</p>
          </div>
          <NuxtLink to="/dashboard/groups" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Barchasi →
          </NuxtLink>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
          <div v-if="loadingStats" class="text-center text-slate-500 text-xs py-4">Yuklanmoqda...</div>
          <div v-else-if="todayGroups.length === 0" class="text-center text-slate-500 text-xs py-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
            Bugun darslar mavjud emas.
          </div>
          <div v-else v-for="group in todayGroups" :key="group._id" class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-4">
            <div>
              <p class="font-bold text-white text-sm">{{ group.title }}</p>
              <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span class="flex items-center gap-1"><Icon name="lucide:clock" class="w-3.5 h-3.5" /> {{ group.start_time }} - {{ group.end_time }}</span>
                <span class="flex items-center gap-1"><Icon name="lucide:door-open" class="w-3.5 h-3.5" /> {{ group.room || '—' }}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs text-indigo-400 font-semibold mb-1">{{ group.teacher?.firstname || 'Ustoz' }}</p>
              <span class="inline-block px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 font-bold border border-slate-700">
                {{ group.students?.length || 0 }} o'quvchi
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Leads -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md flex flex-col h-full">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-md font-bold tracking-tight text-white flex items-center gap-2">
              <Icon name="lucide:inbox" class="w-5 h-5 text-emerald-400" />
              Yangi Arizalar (Leads)
            </h3>
            <p class="text-xs text-slate-500">So'nggi kelgan arizalar</p>
          </div>
          <NuxtLink to="/dashboard/leads" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Barchasi →
          </NuxtLink>
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-800/60 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                <th class="pb-3">Ism Familiya</th>
                <th class="pb-3">Kurs</th>
                <th class="pb-3">Holat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40 text-slate-300">
              <tr v-if="loadingLeads">
                <td colspan="3" class="py-4 text-center text-slate-500 text-xs">Arizalar yuklanmoqda...</td>
              </tr>
              <tr v-else-if="realLeads.length === 0">
                <td colspan="3" class="py-4 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl">Arizalar topilmadi</td>
              </tr>
              <tr v-else v-for="lead in realLeads" :key="lead._id" class="hover:bg-slate-900/20 transition-colors">
                <td class="py-3.5">
                  <p class="font-medium text-white">{{ lead.fullname }}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">{{ lead.phone }}</p>
                </td>
                <td class="py-3.5">
                  <span class="px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-slate-900 border border-slate-800 text-slate-400">
                    {{ lead.course || 'Noma\'lum' }}
                  </span>
                </td>
                <td class="py-3.5">
                  <span :class="getStatusClass(lead.status)">{{ getStatusLabel(lead.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- =========  ABSENTEE MODAL ========= -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAbsenteeModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          @click.self="showAbsenteeModal = false"
        >
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="lucide:user-x" class="w-5 h-5 text-rose-400" />
                  Dars Qoldirganlar Ro'yxati
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">So'nggi 30 kunda 2+ marta kelmagan o'quvchilar</p>
              </div>
              <button @click="showAbsenteeModal = false" class="text-slate-400 hover:text-white text-xl transition-colors">✕</button>
            </div>

            <!-- Loading -->
            <div v-if="loadingAbsentees" class="flex-1 flex items-center justify-center py-12">
              <div class="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            </div>

            <!-- List -->
            <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              <div
                v-for="item in absenteeList"
                :key="item._id"
                class="p-4 hover:bg-slate-900/40 transition-colors flex items-center justify-between gap-4"
              >
                <!-- Left: Student info -->
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                    {{ item.student?.user?.firstname?.[0] || '?' }}
                  </div>
                  <div class="min-w-0">
                    <button
                      @click="openProfile(item.student?._id); showAbsenteeModal = false"
                      class="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors text-left block truncate"
                    >
                      {{ item.student?.user?.firstname }} {{ item.student?.user?.lastname }}
                    </button>
                    <div class="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <a :href="`tel:${item.student?.user?.phone}`" class="text-[10px] text-slate-400 hover:text-indigo-300">📱 {{ item.student?.user?.phone || '—' }}</a>
                      <a v-if="item.student?.parentPhone" :href="`tel:${item.student?.parentPhone}`" class="text-[10px] text-slate-400 hover:text-indigo-300">👨‍👩‍👦 {{ item.student?.parentPhone }}</a>
                    </div>
                    <!-- Guruhlar -->
                    <div class="flex flex-wrap gap-1 mt-1.5">
                      <span
                        v-for="en in item.student?.enrollments"
                        :key="en._id"
                        class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                      >{{ en.group?.title || '—' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right: Absence stats -->
                <div class="shrink-0 text-right">
                  <div class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-sm mb-1"
                    :class="item.totalAbsences >= 5 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'"
                  >
                    <Icon name="lucide:calendar-x" class="w-3.5 h-3.5" />
                    {{ item.totalAbsences }} marta
                  </div>
                  <div class="text-[10px] text-slate-500">
                    Oxirgi: {{ item.recentAbsentDates?.[0] || '—' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StudentProfileModal from '~/components/StudentProfileModal.vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

definePageMeta({ layout: "admin" })

const today = ref("")
const unreadMessages = ref(0)

const fetchUnreadCount = async () => {
  try {
    const token = useCookie("auth_token")
    if (token.value) {
      const response: any = await $fetch("/api/v1/messages?read=false", {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      unreadMessages.value = response.unreadCount || 0
    }
  } catch (err) {
    console.error("Xabarlar statistikasini yuklashda xatolik:", err)
  }
}

const loadingStats = ref(true)
const loadingLeads = ref(true)
const dynamicStats = ref<any[]>([])
const realLeads = ref<any[]>([])
const todayGroups = ref<any[]>([])

// Absent students
const absenteeCount = ref(0)
const absenteeList = ref<any[]>([])
const showAbsenteeModal = ref(false)
const loadingAbsentees = ref(false)

// Student Profile Modal
const showProfileModal = ref(false)
const selectedProfileStudentId = ref('')

const openProfile = (id: string) => {
  if (!id) return
  selectedProfileStudentId.value = id
  showProfileModal.value = true
}

// Chart References
const revenueChartData = ref<any>(null)
const courseDemandData = ref<any>(null)
const leadSourcesData = ref<any>(null)

// Chart Options
const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) { label += ': '; }
          if (context.parsed.y !== null) { label += new Intl.NumberFormat('uz-UZ').format(context.parsed.y) + ' so\'m'; }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#1e293b' },
      ticks: {
        color: '#64748b',
        callback: function(value: any) { return formatMoneyShort(value); }
      }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { weight: 'bold' } }
    }
  }
}

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { color: '#cbd5e1', font: { size: 12 }, padding: 20 }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      borderWidth: 1
    }
  },
  cutout: '70%'
}

const formatMoneyShort = (val: number) => {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' mln'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' ming'
  return val.toString()
}

const fetchDashboardData = async () => {
  try {
    const token = useCookie("auth_token").value
    if (!token) return

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Calculate previous month
    let prevMonthNum = now.getMonth() // 0-indexed, so this is previous month naturally
    let prevYear = now.getFullYear()
    if (prevMonthNum === 0) {
      prevMonthNum = 12
      prevYear -= 1
    }
    const previousMonth = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`

    // Fetch all required data in parallel
    const [studentsRes, groupsRes, leadsRes, currentFinanceRes, prevFinanceRes, debtorsRes, absenteesRes] = await Promise.all([
      $fetch<any>("/api/v1/students", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch<any>("/api/v1/groups", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch<any>("/api/v1/leads", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch<any>(`/api/v1/finance/report?month=${currentMonth}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch<any>(`/api/v1/finance/report?month=${previousMonth}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch<any>(`/api/v1/finance/invoices/debtors?month=${currentMonth}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      $fetch<any>(`/api/v1/students/frequent-absentees?minAbsences=2&days=30`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
    ])

    // Absent students
    absenteeCount.value = absenteesRes?.count || 0
    absenteeList.value = absenteesRes?.data?.absentees || []

    const activeStudents = studentsRes?.data?.students?.filter((s: any) => s.status === 'ACTIVE')?.length || 0
    const allGroups = groupsRes?.data?.groups || []
    const activeGroupsCount = allGroups.length
    
    let allLeads = leadsRes?.data?.leads || []
    allLeads.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const newLeadsCount = allLeads.filter((l: any) => l.status === 'NEW').length
    realLeads.value = allLeads.slice(0, 5)

    const monthlyIncome = currentFinanceRes?.data?.month?.income || 0
    const prevMonthlyIncome = prevFinanceRes?.data?.month?.income || 0

    let incomeTrend = 0
    if (prevMonthlyIncome > 0) {
      incomeTrend = ((monthlyIncome - prevMonthlyIncome) / prevMonthlyIncome) * 100
    } else if (monthlyIncome > 0) {
      incomeTrend = 100
    }
    const trendStr = incomeTrend > 0 ? `+${incomeTrend.toFixed(1)}%` : `${incomeTrend.toFixed(1)}%`
    const trendColor = incomeTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'

    const debtorsList = debtorsRes?.data?.debtors || []
    const totalDebt = debtorsList.reduce((sum: number, inv: any) => sum + (inv.final_amount || inv.amount), 0)

    dynamicStats.value = [
      { label: "O'quvchilar", value: `${activeStudents}`, icon: "lucide:graduation-cap", color: "from-blue-500 to-transparent", iconClass: "text-blue-400" },
      { label: "Guruhlar", value: `${activeGroupsCount}`, icon: "lucide:users", color: "from-indigo-500 to-transparent", iconClass: "text-indigo-400" },
      { label: "Yangi Lidlar", value: `${newLeadsCount}`, icon: "lucide:target", color: "from-emerald-500 to-transparent", iconClass: "text-emerald-400" },
      { label: "Oylik Tushum", value: `${formatMoneyShort(monthlyIncome)}`, icon: "lucide:banknote", color: "from-green-500 to-transparent", iconClass: "text-green-400", textClass: "text-green-400", trend: trendStr, trendColor: trendColor },
      { label: "Jami Qarz", value: `${formatMoneyShort(totalDebt)}`, icon: "lucide:alert-circle", color: "from-rose-500 to-transparent", iconClass: "text-rose-400", textClass: "text-rose-400" }
    ]

    // Initialize Revenue Chart Data
    revenueChartData.value = {
      labels: ['O\'tgan oy', 'Joriy oy'],
      datasets: [{
        label: 'Tushum',
        data: [prevMonthlyIncome, monthlyIncome],
        backgroundColor: ['#475569', '#4f46e5'],
        borderRadius: 8,
        barPercentage: 0.5,
      }]
    }

    // Initialize Course Demand Chart Data
    // Aggregate students per course from active groups
    const courseDemandMap: Record<string, number> = {}
    let totalStudentsInCourses = 0
    allGroups.forEach((g: any) => {
      if (g.course) {
        const courseName = typeof g.course === 'object' ? g.course.title : g.course
        if (!courseDemandMap[courseName]) courseDemandMap[courseName] = 0
        const count = g.students?.length || 0
        courseDemandMap[courseName] += count
        totalStudentsInCourses += count
      }
    })
    
    const rawLabels = Object.keys(courseDemandMap)
    let courseLabels: string[] = []
    let courseData: number[] = []
    
    // Add percentage to labels
    if (rawLabels.length === 0 || totalStudentsInCourses === 0) {
      courseLabels.push("Ma'lumot yo'q")
      courseData.push(1)
    } else {
      rawLabels.forEach(label => {
        const count = courseDemandMap[label] || 0
        if (count > 0) {
          const percent = Math.round((count / totalStudentsInCourses) * 100)
          courseLabels.push(`${label} (${percent}%)`)
          courseData.push(count)
        }
      })
    }

    courseDemandData.value = {
      labels: courseLabels,
      datasets: [{
        data: courseData,
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    }

    // Initialize Lead Sources Chart Data
    const sourceMap: Record<string, number> = {}
    let totalSources = 0
    
    // Merge leads and students to see the full picture
    const allPeople = [...allLeads, ...(studentsRes?.data?.students || [])]
    
    allPeople.forEach((p: any) => {
      let source = p.source || 'WEBSITE' // Default fallback
      
      // Convert ENUM to readable labels
      const sourceLabels: any = {
        'WEBSITE': 'Veb-sayt',
        'TELEGRAM': 'Telegram',
        'INSTAGRAM': 'Instagram',
        'FACEBOOK': 'Facebook',
        'REFERRAL': "Do'st orqali",
        'FRIENDS': "Do'stlar (Eski)",
        'ADVERTISEMENT': "Reklama"
      }
      
      const readableSource = sourceLabels[source] || source
      if (!sourceMap[readableSource]) sourceMap[readableSource] = 0
      sourceMap[readableSource]++
      totalSources++
    })

    const sourceRawLabels = Object.keys(sourceMap)
    let sourceChartLabels: string[] = []
    let sourceChartData: number[] = []

    if (sourceRawLabels.length === 0 || totalSources === 0) {
      sourceChartLabels.push("Ma'lumot yo'q")
      sourceChartData.push(1)
    } else {
      // Sort by count descending
      sourceRawLabels.sort((a, b) => (sourceMap[b] || 0) - (sourceMap[a] || 0)).forEach(label => {
        const count = sourceMap[label] || 0
        const percent = Math.round((count / totalSources) * 100)
        sourceChartLabels.push(`${label} (${percent}%)`)
        sourceChartData.push(count)
      })
    }

    leadSourcesData.value = {
      labels: sourceChartLabels,
      datasets: [{
        data: sourceChartData,
        backgroundColor: ['#10b981', '#f59e0b', '#4f46e5', '#ec4899', '#0ea5e9', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    }

    // Filter Today's Groups
    const dayOfWeek = now.getDay() // 0 = Sun, 1 = Mon ...
    const isEvenDay = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6 // Tue, Thu, Sat
    const isOddDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 // Mon, Wed, Fri
    
    todayGroups.value = allGroups.filter((g: any) => {
      const days = g.days || ''
      if (days === 'EVERYDAY') return true
      if (isEvenDay && days === 'EVEN') return true
      if (isOddDay && days === 'ODD') return true
      return false
    })

    loadingStats.value = false
    loadingLeads.value = false
  } catch (err) {
    console.error("Dashboard datalarini yuklashda xatolik:", err)
    loadingStats.value = false
    loadingLeads.value = false
  }
}

onMounted(() => {
  const roleCookie = useCookie("auth_role")
  if (roleCookie.value === 'TEACHER') {
    useRouter().push("/dashboard/teacher")
    return
  }
  if (roleCookie.value === 'FINANCE_ADMIN') {
    useRouter().push("/dashboard/finance")
    return
  }

  today.value = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })
  fetchUnreadCount()
  fetchDashboardData()
})

const getStatusLabel = (status: string) => {
  const map: any = { 'NEW': 'Yangi', 'CONTACTED': 'Suhbatda', 'REGISTERED': 'Yozildi', 'REJECTED': 'Rad etildi' }
  return map[status] || status
}

const getStatusClass = (status: string) => {
  if (status === "REGISTERED") return "inline-flex text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded"
  if (status === "CONTACTED")  return "inline-flex text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded"
  if (status === "REJECTED")   return "inline-flex text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded"
  return "inline-flex text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded"
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
