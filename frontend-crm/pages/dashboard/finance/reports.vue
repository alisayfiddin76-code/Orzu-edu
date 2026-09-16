<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">📈 Oy Hisoboti</h1>
        <p class="text-sm text-slate-400 mt-1">Kirim, chiqim va sof foyda tahlili</p>
      </div>
      <select v-model="selectedMonth" @change="fetchReport" class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
        <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <div class="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
    </div>

    <template v-else-if="report">
      <!-- Main stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <p class="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider">Kirim</p>
          <p class="text-2xl font-black text-emerald-400">{{ formatMoney(report.income) }}</p>
          <p class="text-[10px] text-slate-600">{{ report.paid_invoices_count }} ta to'lov</p>
        </div>
        <div class="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
          <p class="text-[10px] text-rose-400/70 font-bold uppercase tracking-wider">Chiqim</p>
          <p class="text-2xl font-black text-rose-400">{{ formatMoney(report.expense) }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-1">
          <p class="text-[10px] text-violet-400/70 font-bold uppercase tracking-wider">O'qituvchilar ulushi</p>
          <p class="text-2xl font-black text-violet-400">{{ formatMoney(report.teacher_share) }}</p>
        </div>
        <div class="p-5 rounded-2xl border space-y-1" :class="report.net_profit >= 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-rose-500/10 border-rose-500/20'">
          <p class="text-[10px] font-bold uppercase tracking-wider" :class="report.net_profit >= 0 ? 'text-indigo-400/70' : 'text-rose-400/70'">Sof Foyda</p>
          <p class="text-2xl font-black" :class="report.net_profit >= 0 ? 'text-indigo-400' : 'text-rose-400'">{{ formatMoney(report.net_profit) }}</p>
        </div>
      </div>

      <!-- By Payment Method -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <h3 class="text-sm font-bold text-white mb-4">💳 To'lov usullari bo'yicha</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="(val, key) in report.by_payment_method" :key="key" class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p class="text-xs text-slate-400 font-semibold mb-1">{{ key }}</p>
            <p class="text-lg font-black text-white">{{ formatMoneyShort(val) }}</p>
            <div class="mt-2 h-1 rounded-full bg-slate-800">
              <div class="h-1 rounded-full bg-indigo-500" :style="`width: ${report.income ? (val / report.income * 100) : 0}%`"></div>
            </div>
            <p class="text-[10px] text-slate-600 mt-1">{{ report.income ? (val / report.income * 100).toFixed(0) : 0 }}%</p>
          </div>
        </div>
      </div>

      <!-- Formula breakdown -->
      <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <h3 class="text-sm font-bold text-white mb-4">🧮 Hisob-kitob formulasi</h3>
        <div class="space-y-3 font-mono text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">Jami kirim</span>
            <span class="text-emerald-400 font-bold">+ {{ formatMoney(report.income) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Jami chiqim</span>
            <span class="text-rose-400 font-bold">− {{ formatMoney(report.expense) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">O'qituvchilar ulushi</span>
            <span class="text-violet-400 font-bold">− {{ formatMoney(report.teacher_share) }}</span>
          </div>
          <div class="border-t border-slate-700 pt-3 flex justify-between">
            <span class="text-white font-bold">Sof foyda</span>
            <span class="font-black text-lg" :class="report.net_profit >= 0 ? 'text-indigo-400' : 'text-rose-400'">
              = {{ formatMoney(report.net_profit) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
definePageMeta({ layout: 'admin' })
useHead({ title: 'Hisobot — ORZU EDU' })

const report = ref<any>(null)
const loading = ref(true)
const error = ref('')

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const selectedMonth = ref(getCurrentMonth())

const monthOptions = computed(() => {
  const opts = []
  const now = new Date()
  for (let i = -1; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ value: v, label: d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' }) })
  }
  return opts
})

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'
const formatMoneyShort = (val: number) => {
  if (!val) return '0'
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' mln'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' ming'
  return val.toString()
}

const fetchReport = async () => {
  loading.value = true; error.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(
      `/api/v1/finance/report?month=${selectedMonth.value}`,
      { headers: { Authorization: `Bearer ${token.value}` } }
    )
    report.value = res.data
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>
