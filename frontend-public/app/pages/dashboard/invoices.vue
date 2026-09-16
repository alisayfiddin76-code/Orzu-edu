<template>
  <div class="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
    <div class="max-w-3xl mx-auto space-y-6">

      <!-- Header: Premium Brand Design -->
      <div class="relative overflow-hidden rounded-3xl bg-brand-primary border-b-4 border-brand-accent p-6 sm:p-8 shadow-xl shadow-brand-primary/10">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-accent/10 blur-2xl"></div>
        
        <div class="relative z-10">
          <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 text-[#94B0C7] hover:text-white text-sm font-bold transition-all duration-300 mb-6 group">
            <span class="group-hover:-translate-x-1 transition-transform duration-300">←</span> Kabinetga qaytish
          </NuxtLink>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent border border-brand-accent/30 mb-4">
            Moliya va to'lovlar
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">💳</span> Mening To'lovlarim
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">Barcha oylik to'lovlar tarixi</p>
        </div>
      </div>

      <!-- Month Filter -->
      <div class="flex gap-3 flex-wrap bg-white p-2 rounded-2xl border border-brand-border shadow-sm">
        <button
          v-for="m in monthOptions" :key="m.value"
          @click="selectedMonth = m.value"
          class="px-5 py-2.5 rounded-xl text-sm font-black transition-all"
          :class="selectedMonth === m.value
            ? 'bg-brand-primary text-white shadow-md'
            : 'bg-transparent text-brand-textSecondary hover:bg-brand-background hover:text-brand-primary'"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-brand-border shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-brand-textSecondary mt-4">To'lovlar yuklanmoqda...</p>
      </div>

      <!-- Summary Card -->
      <div v-else-if="invoices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-6 rounded-2xl bg-white border border-brand-border shadow-sm text-center relative overflow-hidden group hover:-translate-y-1 transition-all hover:border-green-300">
          <div class="absolute inset-0 bg-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <div class="w-10 h-10 mx-auto bg-green-50 rounded-full flex items-center justify-center text-lg mb-2">✅</div>
            <p class="text-[10px] text-brand-textSecondary font-black uppercase tracking-widest mb-1">To'langan</p>
            <p class="text-2xl sm:text-3xl font-black text-green-600">{{ formatMoney(paidTotal) }}</p>
            <p class="text-xs font-bold text-brand-textSecondary mt-2">{{ paidCount }} ta to'lov</p>
          </div>
        </div>
        <div class="p-6 rounded-2xl bg-white border border-brand-border shadow-sm text-center relative overflow-hidden group hover:-translate-y-1 transition-all hover:border-red-300">
          <div class="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <div class="w-10 h-10 mx-auto bg-red-50 rounded-full flex items-center justify-center text-lg mb-2">❌</div>
            <p class="text-[10px] text-brand-textSecondary font-black uppercase tracking-widest mb-1">Qarzdorlik</p>
            <p class="text-2xl sm:text-3xl font-black text-red-600">{{ formatMoney(unpaidTotal) }}</p>
            <p class="text-xs font-bold text-brand-textSecondary mt-2">{{ unpaidCount }} ta to'lanmagan</p>
          </div>
        </div>
      </div>

      <!-- Invoice List -->
      <div v-if="!loading" class="space-y-4">
        <div
          v-for="inv in invoices" :key="inv._id"
          class="p-5 sm:p-6 rounded-3xl border bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          :class="{
            'border-green-200': inv.status === 'PAID',
            'border-red-200': inv.status === 'UNPAID',
            'border-brand-border': inv.status === 'CANCELLED',
          }"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div class="flex-1">
              <p class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3"
                :class="{
                  'bg-green-50 text-green-700': inv.status === 'PAID',
                  'bg-red-50 text-red-600': inv.status === 'UNPAID',
                  'bg-brand-background text-brand-textSecondary': inv.status === 'CANCELLED',
                }">
                {{ statusLabel(inv.status) }}
              </p>
              <p class="text-brand-primary font-black text-lg">{{ inv.group?.title || 'Guruh' }}</p>
              <p class="text-sm text-brand-textSecondary mt-1 font-bold">{{ inv.group?.course?.title }} — {{ inv.month }} oyi uchun</p>
              
              <div class="mt-3 space-y-1.5">
                <p class="text-xs text-brand-textPrimary font-medium flex items-center gap-1.5 bg-brand-background w-fit px-3 py-1 rounded-lg">
                  <span class="text-brand-primary">📅</span> To'lov muddati: <span class="font-bold">{{ formatDate(inv.due_date) }} gacha</span>
                </p>
                <p v-if="inv.paid_at" class="text-xs text-brand-textPrimary font-medium flex items-center gap-1.5 bg-brand-success/10 border border-brand-success/20 w-fit px-3 py-1 rounded-lg">
                  <span class="text-brand-success">✅</span> To'langan sana: <span class="font-bold text-brand-success">{{ formatDate(inv.paid_at) }}</span> ({{ inv.payment_method || 'NAQD' }})
                </p>
                <p v-if="inv.paid_at" class="text-xs text-brand-textPrimary font-medium flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/20 w-fit px-3 py-1 rounded-lg">
                  <span class="text-brand-primary">⏳</span> Amal qilish muddati: <span class="font-bold text-brand-primary">{{ getValidUntil(inv.paid_at) }} gacha</span>
                </p>
              </div>
            </div>
            <div class="sm:text-right shrink-0 bg-brand-background sm:bg-transparent p-4 sm:p-0 rounded-xl mt-4 sm:mt-0">
              <p class="text-[10px] font-black text-brand-textSecondary uppercase tracking-widest mb-1 sm:hidden">To'lov miqdori:</p>
              <p class="text-xl sm:text-2xl font-black"
                :class="{
                  'text-green-600': inv.status === 'PAID',
                  'text-red-600': inv.status === 'UNPAID',
                  'text-brand-textSecondary': inv.status === 'CANCELLED',
                }">
                {{ formatMoney(inv.final_amount || inv.amount) }}
              </p>
              <p v-if="inv.discount > 0" class="text-[11px] font-bold text-brand-textSecondary mt-1 sm:mt-2">
                Chegirma: <span class="text-brand-accent">{{ formatMoney(inv.discount) }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="invoices.length === 0 && !loading" class="py-16 text-center bg-white rounded-3xl border border-brand-border shadow-sm px-6">
          <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">💳</div>
          <p class="text-lg font-black text-brand-primary">Bu oyda to'lovlar topilmadi</p>
          <p class="text-sm text-brand-textSecondary mt-2 font-medium">Boshqa oylarni tanlab ko'ring.</p>
        </div>
      </div>

      <div v-if="error" class="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Mening To'lovlarim — ORZU EDU" })

const authStore = useAuthStore()

const allInvoices = ref<any[]>([])
const invoices = computed(() => allInvoices.value.filter((i: any) => i.month === selectedMonth.value))
const joinedDate = ref<string | null>(null)

const loading = ref(true)
const error = ref('')

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const selectedMonth = ref(getCurrentMonth())

const uzbekMonths = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
]

const monthOptions = computed(() => {
  const opts = []
  const now = new Date()
  
  // O'quvchi dars boshlagan sana yoki bo'lmasa joriy oy
  let startDate = joinedDate.value ? new Date(joinedDate.value) : new Date(now.getFullYear(), now.getMonth(), 1)
  if (isNaN(startDate.getTime())) startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Kelajakdagi sanalar xato kiritilgan bo'lsa, joriy oy bilan chegaralaymiz
  if (startDate > now) startDate = now;

  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Eng ko'pi bilan oxirgi 2-3 yilni ko'rsatish (xotira to'lib ketmasligi uchun cheklov, masalan 36 oy)
  let loopCount = 0
  
  while (current <= end && loopCount < 36) {
    const val = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    const label = `${current.getFullYear()}-yil ${uzbekMonths[current.getMonth()]}`
    opts.push({ value: val, label })
    current.setMonth(current.getMonth() + 1)
    loopCount++
  }
  
  return opts
})

const paidCount = computed(() => invoices.value.filter((i: any) => i.status === 'PAID').length)
const unpaidCount = computed(() => invoices.value.filter((i: any) => i.status === 'UNPAID').length)
const paidTotal = computed(() => invoices.value.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + (i.final_amount || i.amount || 0), 0))
const unpaidTotal = computed(() => invoices.value.filter((i: any) => i.status === 'UNPAID').reduce((s: number, i: any) => s + (i.final_amount || i.amount || 0), 0))

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const day = d.getDate()
  const month = uzbekMonths[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${month} ${year}-yil`
}

const getValidUntil = (paidDateStr: string) => {
  if (!paidDateStr) return '—'
  const d = new Date(paidDateStr)
  if (isNaN(d.getTime())) return '—'
  d.setMonth(d.getMonth() + 1)
  const day = d.getDate()
  const month = uzbekMonths[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${month} ${year}-yil`
}
const statusLabel = (s: string) => ({ PAID: '✅ To\'langan', UNPAID: '❌ To\'lanmagan', CANCELLED: '🚫 Bekor qilingan', REFUND: '↩️ Qaytarilgan' })[s] || s

const fetchInvoices = async () => {
  loading.value = true
  error.value = ''
  try {
    // frontend-public tokenini localStorage dan olamiz (authStore orqali)
    if (import.meta.client) {
      authStore.initializeStore()
    }
    const token = authStore.token
    if (!token) {
      error.value = 'Tizimga kiring'
      navigateTo('/login')
      return
    }
    // Barcha to'lovlarni birdaniga olamiz
    const res = await $fetch<any>('/api/v1/students/my-invoices', {
      headers: { Authorization: `Bearer ${token}` }
    })
    allInvoices.value = res.data?.invoices || []
    joinedDate.value = res.data?.joinedDate || null
    
    // Default holatda eng oxirgi (eng yangi) oyni tanlaymiz
    if (monthOptions.value.length > 0) {
      selectedMonth.value = monthOptions.value[monthOptions.value.length - 1].value
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

onMounted(fetchInvoices)
</script>
