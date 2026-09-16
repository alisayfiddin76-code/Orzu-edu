<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">💰 Moliya Boshqaruvi</h1>
        <ClientOnly fallback=""><p class="text-sm text-slate-400 mt-1">{{ today }} — Real vaqt moliyaviy ko'rsatkichlar</p></ClientOnly>
      </div>
      <ClientOnly fallback=""><div class="flex items-center gap-3">
        <select 
          v-model="selectedMonth" 
          @change="fetchDashboard"
          class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
        >
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <span class="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold hidden sm:inline-block">
          ● Real vaqt
        </span>
      </div></ClientOnly>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 text-center">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400 text-sm">Yuklanmoqda...</p>
    </div>

    <template v-else-if="stats">
      <!-- TODAY STATS -->
      <div>
        <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">📅 Bugun</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tushum</p>
            <p class="text-2xl font-black text-emerald-400">{{ formatMoney(stats.today.income) }}</p>
            <p class="text-[10px] text-slate-600">{{ stats.today.paid_count }} ta to'lov</p>
          </div>
          <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Chiqim</p>
            <p class="text-2xl font-black text-rose-400">{{ formatMoney(stats.today.expense) }}</p>
            <p class="text-[10px] text-slate-600">bugungi xarajatlar</p>
          </div>

          <!-- Cashbox by method -->
          <div class="col-span-2 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">💳 Kassa (bugun)</p>
            <div class="grid grid-cols-4 gap-2">
              <div v-for="(val, key) in stats.today.cashbox" :key="key" class="text-center">
                <p class="text-xs text-slate-500 mb-1">{{ key }}</p>
                <p class="text-sm font-bold text-white">{{ formatMoneyShort(val) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MONTH STATS -->
      <div>
        <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">📊 Shu oy</h2>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950/80 border border-emerald-800/30 space-y-1">
            <p class="text-xs text-emerald-500/70 font-semibold uppercase tracking-wider">Jami Tushum</p>
            <p class="text-2xl font-black text-emerald-400">{{ formatMoney(stats.month.income) }}</p>
          </div>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-rose-950/60 to-slate-950/80 border border-rose-800/30 space-y-1">
            <p class="text-xs text-rose-500/70 font-semibold uppercase tracking-wider">Jami Chiqim</p>
            <p class="text-2xl font-black text-rose-400">{{ formatMoney(stats.month.expense) }}</p>
          </div>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-950/80 border border-indigo-800/30 space-y-1">
            <p class="text-xs text-indigo-400/70 font-semibold uppercase tracking-wider">Sof Foyda</p>
            <p class="text-2xl font-black" :class="stats.month.profit >= 0 ? 'text-indigo-400' : 'text-rose-400'">
              {{ formatMoney(stats.month.profit) }}
            </p>
          </div>
        </div>
      </div>

      <!-- EXTRA STATS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-slate-950/40 border border-amber-800/20 space-y-1">
          <p class="text-xs text-amber-500/70 font-semibold uppercase tracking-wider">❌ Qarzdorlik</p>
          <p class="text-2xl font-black text-amber-400">{{ formatMoney(stats.month.total_debt) }}</p>
          <p class="text-[10px] text-slate-600">{{ stats.month.debtors_count }} ta to'lanmagan invoice</p>
        </div>
        <div class="p-5 rounded-2xl bg-slate-950/40 border border-violet-800/20 space-y-1">
          <p class="text-xs text-violet-400/70 font-semibold uppercase tracking-wider">👨‍🏫 O'qituvchilarga</p>
          <p class="text-2xl font-black text-violet-400">{{ formatMoney(stats.teachers_owed) }}</p>
          <p class="text-[10px] text-slate-600">to'lanishi kerak</p>
        </div>
        <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">🔗 Tez o'tish</p>
          <div class="space-y-2">
            <NuxtLink to="/dashboard/finance/payments" class="block text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">→ To'lov qabul qilish</NuxtLink>
            <NuxtLink to="/dashboard/finance/paid" class="block text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">→ To'laganlar ro'yxati</NuxtLink>
            <NuxtLink to="/dashboard/finance/debtors" class="block text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">→ Qarzdorlar ro'yxati</NuxtLink>
            <NuxtLink to="/dashboard/finance/teachers" class="block text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">→ O'qituvchilar hisobi</NuxtLink>
            <NuxtLink to="/dashboard/finance/reports" class="block text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors">→ Oy hisoboti</NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
definePageMeta({ layout: 'admin' })

useHead({ title: 'Finance Dashboard — ORZU EDU' })

const loading = ref(true)
const error = ref('')
const stats = ref<any>(null)

const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const selectedMonth = ref(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

const monthOptions = computed(() => {
  const opts = []
  const now = new Date()
  for (let i = -1; i < 6; i++) { // Include next month and 5 previous months
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
    opts.push({ value: val, label })
  }
  return opts
})

const formatMoney = (val: number) => {
  if (!val) return '0 so\'m'
  return new Intl.NumberFormat('uz-UZ').format(val) + ' so\'m'
}

const formatMoneyShort = (val: number) => {
  if (!val) return '0'
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' mln'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' ming'
  return val.toString()
}

const fetchDashboard = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(`/api/v1/finance/dashboard?month=${selectedMonth.value}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    stats.value = res.data
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)
</script>
