<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">✅ To'laganlar</h1>
        <p class="text-sm text-slate-400 mt-1">To'lovlarni muvaffaqiyatli amalga oshirgan o'quvchilar</p>
      </div>
      <select v-model="selectedMonth" @change="fetchPaidStudents" class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
        <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4">
      <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
        <p class="text-2xl font-black text-emerald-400">{{ invoices.length }}</p>
        <p class="text-xs text-slate-400 mt-1">To'lov qilgan o'quvchi</p>
      </div>
      <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
        <p class="text-2xl font-black text-indigo-400">{{ formatMoneyShort(totalCollected) }}</p>
        <p class="text-xs text-slate-400 mt-1">Jami tushum (shu ro'yxat bo'yicha)</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-8 text-center">
      <div class="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
    </div>

    <!-- Paid Table -->
    <div v-else-if="invoices.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th class="px-5 py-4">O'quvchi</th>
            <th class="px-5 py-4">Guruh</th>
            <th class="px-5 py-4">Summa</th>
            <th class="px-5 py-4">To'lov Vaqti</th>
            <th class="px-5 py-4">Usul</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr v-for="inv in invoices" :key="inv._id" class="hover:bg-slate-900/20 transition-colors">
            <td class="px-5 py-4">
              <button @click="openProfileModal(inv.student?._id)" class="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors text-left">
                {{ inv.student?.user?.firstname }} {{ inv.student?.user?.lastname }}
              </button>
              <p class="text-[10px] text-slate-500">{{ inv.student?.user?.phone }}</p>
            </td>
            <td class="px-5 py-4 text-slate-300">{{ inv.group?.title }}</td>
            <td class="px-5 py-4 font-bold text-emerald-400">{{ formatMoney(inv.final_amount || inv.amount) }}</td>
            <td class="px-5 py-4 text-slate-400 text-xs">
              {{ inv.paid_at ? new Date(inv.paid_at).toLocaleString('uz-UZ') : '—' }}
            </td>
            <td class="px-5 py-4">
              <span class="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {{ inv.payment_method || 'NAQD' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading" class="py-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <p class="text-slate-400 text-lg">Bu oyda hozircha to'lovlar qabul qilinmagan.</p>
    </div>

    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>
    
    <StudentProfileModal v-model="showProfileModal" :studentId="selectedProfileStudentId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StudentProfileModal from '~/components/StudentProfileModal.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'To\'laganlar — ORZU EDU' })

const showProfileModal = ref(false)
const selectedProfileStudentId = ref('')

const openProfileModal = (id: string) => {
  selectedProfileStudentId.value = id
  showProfileModal.value = true
}

const invoices = ref<any[]>([])
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
  for (let i = -1; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
    opts.push({ value: val, label })
  }
  return opts
})

const totalCollected = computed(() => invoices.value.reduce((s, inv) => s + (inv.final_amount || inv.amount || 0), 0))

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'
const formatMoneyShort = (val: number) => {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' mln'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' ming'
  return val.toString()
}

const fetchPaidStudents = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(
      `/api/v1/finance/invoices?status=PAID&month=${selectedMonth.value}`,
      { headers: { Authorization: `Bearer ${token.value}` } }
    )
    invoices.value = res.data?.invoices || []
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPaidStudents)
</script>
