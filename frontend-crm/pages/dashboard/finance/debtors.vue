<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">❌ Qarzdorlar</h1>
        <p class="text-sm text-slate-400 mt-1">To'lovlarni amalga oshirmagan o'quvchilar</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="generateInvoices"
          :disabled="generating"
          title="Bu oy uchun barcha o'quvchilarga invoice yaratadi (avtomatik topilmasa)"
          class="text-xs px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="generating" class="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin inline-block"></span>
          <span>{{ generating ? 'Yaratilmoqda...' : '⚡ Invoice Yaratish' }}</span>
        </button>
        <select v-model="selectedMonth" @change="fetchDebtors" class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
    </div>
    <div v-if="generateMsg" class="p-3 rounded-xl text-xs font-semibold" :class="generateMsg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'">{{ generateMsg }}</div>


    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
        <p class="text-2xl font-black text-rose-400">{{ debtors.length }}</p>
        <p class="text-xs text-slate-400 mt-1">Qarzdor o'quvchi</p>
      </div>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
        <p class="text-2xl font-black text-amber-400">{{ formatMoneyShort(totalDebt) }}</p>
        <p class="text-xs text-slate-400 mt-1">Jami qarzdorlik</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
        <p class="text-2xl font-black text-white">{{ overdueCount }}</p>
        <p class="text-xs text-slate-400 mt-1">Muddati o'tgan</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-8 text-center">
      <div class="w-7 h-7 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
    </div>

    <template v-else>
      <!-- Search -->
      <div class="relative mb-6">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="Ism yoki telefon bo'yicha qidirish..." class="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 transition-colors" />
        <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs transition-colors">✕</button>
      </div>

      <!-- Debtors Table -->
      <div v-if="filteredDebtors.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden">
        <table class="w-full text-sm text-left">
        <thead class="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th class="px-5 py-4">O'quvchi</th>
            <th class="px-5 py-4">Guruh & O'qituvchi</th>
            <th class="px-5 py-4">Summa</th>
            <th class="px-5 py-4">Kechikdi</th>
            <th v-if="userRole !== 'TEACHER'" class="px-5 py-4">Amal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr v-for="d in filteredDebtors" :key="d._id" class="hover:bg-slate-900/20 transition-colors">
            <td class="px-5 py-4">
              <button @click="openProfileModal(d.student?._id)" class="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors text-left block">
                {{ d.student?.user?.firstname }} {{ d.student?.user?.lastname }}
              </button>
              <div class="flex flex-col mt-1 space-y-0.5">
                <a :href="`tel:${d.student?.user?.phone}`" class="text-[10px] text-slate-400 hover:text-indigo-300">📱 O'z: {{ d.student?.user?.phone || 'Kiritilmagan' }}</a>
                <a v-if="d.student?.parentPhone" :href="`tel:${d.student?.parentPhone}`" class="text-[10px] text-slate-400 hover:text-indigo-300">👨‍👩‍👦 Ota-ona: {{ d.student?.parentPhone }}</a>
              </div>
            </td>
            <td class="px-5 py-4">
              <p class="text-slate-200 font-semibold mb-1">{{ d.group?.title }}</p>
              <div class="text-[10px] text-slate-400 flex flex-col space-y-0.5">
                <span>👨‍🏫 {{ d.group?.teacher?.firstname }} {{ d.group?.teacher?.lastname }}</span>
                <span>🚪 Xona: {{ d.group?.room || '—' }} | ⌚ Vaqt: {{ d.group?.start_time || '—' }} - {{ d.group?.end_time || '—' }}</span>
              </div>
            </td>
            <td class="px-5 py-4">
              <div>
                <span v-if="d.discount_info?.has_discount" class="text-xs line-through text-slate-500">{{ formatMoney(d.amount) }}</span>
                <span class="font-bold" :class="d.discount_info?.has_discount ? 'text-amber-400' : 'text-rose-400'">{{ formatMoney(d.final_amount || d.amount) }}</span>
                <span v-if="d.is_virtual" class="ml-2 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full inline-block uppercase tracking-wider">Invoice yo'q</span>
              </div>
              <div v-if="d.discount_info?.has_discount" class="mt-0.5 flex items-center gap-1">
                <span class="text-[10px] text-amber-400">🏷️</span>
                <span v-if="d.discount_info.auto_discount_amount > 0" class="text-[10px] text-amber-400">Avto −10%</span>
                <span v-if="d.discount_info.manual_discount_amount > 0" class="text-[10px] text-amber-400">Qo'lda −{{ formatMoney(d.discount_info.manual_discount_amount) }}</span>
              </div>
            </td>
            <td class="px-5 py-4">
              <span v-if="d.days_overdue > 0" class="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full inline-block">
                {{ d.days_overdue }} kun
              </span>
              <span v-else class="text-xs text-amber-400 font-semibold inline-block">Hali muddati bor</span>
            </td>
            <td v-if="userRole !== 'TEACHER'" class="px-5 py-4">
              <button
                @click="openPayModal(d)"
                class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              >
                To'lash
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

      <div v-else class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
        <span class="text-4xl mb-4 block">👍</span>
        <p class="text-slate-400 font-medium">Bu oy uchun qarzdorlar yo'q</p>
      </div>
    </template>

    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>
    
    <!-- Student Profile Modal -->
    <StudentProfileModal v-model="showProfileModal" :studentId="selectedProfileStudentId" />

    <!-- Payment Modal -->
    <div v-if="showPayModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">To'lov qabul qilish</h3>
          <button @click="closePayModal" class="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="payError" class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
            {{ payError }}
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">O'quvchi</p>
            <p class="text-white font-semibold">{{ payData.studentName }}</p>
          </div>
          <!-- Chegirma info -->
          <div v-if="payData.discount_info?.has_discount" class="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span class="text-amber-400">🏷️</span>
            <div class="flex-1 text-xs">
              <p class="text-amber-300 font-bold mb-0.5">Chegirma qo'llanildi</p>
              <p v-if="payData.discount_info.auto_discount_amount > 0" class="text-slate-400">Avto (2+ guruh): −{{ formatMoney(payData.discount_info.auto_discount_amount) }}</p>
              <p v-if="payData.discount_info.manual_discount_amount > 0" class="text-slate-400">Qo'lda chegirma: −{{ formatMoney(payData.discount_info.manual_discount_amount) }}</p>
              <p v-if="payData.discount_info.manual_discount_reason" class="text-slate-500 italic">({{ payData.discount_info.manual_discount_reason }})</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500 line-through">{{ formatMoney(payData.original_amount) }}</p>
              <p class="text-sm font-black text-amber-400">{{ formatMoney(payData.amount) }}</p>
            </div>
          </div>
          <div v-else>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Qarz summasi</p>
            <p class="text-xl font-black text-rose-400">{{ formatMoney(payData.amount) }}</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">To'lov usuli</label>
            <div class="grid grid-cols-2 gap-3">
              <button @click="payData.method = 'CASH'" :class="['py-2 rounded-xl text-sm font-semibold transition-colors border', payData.method === 'CASH' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700']">💵 Naqd</button>
              <button @click="payData.method = 'CARD'" :class="['py-2 rounded-xl text-sm font-semibold transition-colors border', payData.method === 'CARD' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700']">💳 Karta (Terminal)</button>
              <button @click="payData.method = 'CLICK'" :class="['py-2 rounded-xl text-sm font-semibold transition-colors border', payData.method === 'CLICK' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700']">📱 Click / Payme</button>
              <button @click="payData.method = 'BANK'" :class="['py-2 rounded-xl text-sm font-semibold transition-colors border', payData.method === 'BANK' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700']">🏦 Bank o'tkazma</button>
            </div>
          </div>
          <!-- Jami to'lanadigan summa -->
          <div class="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p class="text-xs text-slate-400">To'lanadigan summa:</p>
            <p class="text-xl font-black text-emerald-400">{{ formatMoney(payData.amount) }}</p>
          </div>
          <div class="pt-2">
            <button @click="submitPayment" :disabled="submittingPay" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
              <span v-if="submittingPay" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ submittingPay ? "To'lov qabul qilinmoqda..." : "To'lovni tasdiqlash" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Overdue Students Modal -->
    <div v-if="showOverdueModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">Muddati o'tgan o'quvchilar</h3>
          <button @click="closeOverdueModal" class="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <div class="p-6 space-y-4 max-h-96 overflow-y-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th class="px-4 py-2">O'quvchi</th>
                <th class="px-4 py-2">Guruh</th>
                <th class="px-4 py-2">Qarz</th>
                <th class="px-4 py-2">Kechikdi (kun)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
              <tr v-for="od in overdueList" :key="od._id" class="hover:bg-slate-900/20 transition-colors">
                <td class="px-4 py-2">{{ od.student?.user?.firstname }} {{ od.student?.user?.lastname }}</td>
                <td class="px-4 py-2">{{ od.group?.title }}</td>
                <td class="px-4 py-2 text-rose-400">{{ formatMoney(od.final_amount || od.amount) }}</td>
                <td class="px-4 py-2 text-rose-500">{{ od.days_overdue }} kun</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StudentProfileModal from '~/components/StudentProfileModal.vue'

definePageMeta({ layout: 'admin' })

// Foydalanuvchi rolini cookie'dan o'qish
const _roleCookie = useCookie('auth_role')
const userRole = computed(() => _roleCookie.value || 'SUPER_ADMIN')
useHead({ title: 'Qarzdorlar — ORZU EDU' })

const showProfileModal = ref(false)
const selectedProfileStudentId = ref('')
const searchQuery = ref('')
const showOverdueModal = ref(false)
const overdueList = computed(() => debtors.value.filter((d: any) => d.days_overdue > 0))
const openOverdueModal = (d: any) => {
  showOverdueModal.value = true
}
const closeOverdueModal = () => {
  showOverdueModal.value = false
}

const openProfileModal = (id: string) => {
  selectedProfileStudentId.value = id
  showProfileModal.value = true
}

const filteredDebtors = computed(() => {
  if (!searchQuery.value.trim()) {
    // Exclude invoices without a linked student (placeholder)
    return debtors.value.filter((d: any) => d.student && d.student.user && d.student.user.firstname !== 'N/A');
  }
  const q = searchQuery.value.toLowerCase().trim();
  return debtors.value.filter((d: any) => {
    // Exclude missing student entries
    if (!d.student || !d.student.user || d.student.user.firstname === 'N/A') return false;
    const name = `${d.student.user.firstname} ${d.student.user.lastname}`.toLowerCase();
    const phone = (d.student.user.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });
});

const debtors = ref<any[]>([])
const loading = ref(true)
const error = ref('')

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const selectedMonth = ref(getCurrentMonth())

const monthOptions = computed(() => {
  const UZ_MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ]
  const opts = []
  const now = new Date()
  for (let i = -1; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    opts.push({ value: val, label })
  }
  return opts
})

const totalDebt = computed(() => debtors.value.reduce((s, d) => s + (d.final_amount || d.amount || 0), 0))
const overdueCount = computed(() => debtors.value.filter(d => d.days_overdue > 0).length)

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'
const formatMoneyShort = (val: number) => {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' mln'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' ming'
  return val.toString()
}

const fetchDebtors = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(
      `/api/v1/finance/invoices/debtors?month=${selectedMonth.value}`,
      { headers: { Authorization: `Bearer ${token.value}` } }
    )
    debtors.value = res.data?.debtors || []
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

// Payment Modal Logic
const showPayModal = ref(false)
const submittingPay = ref(false)
const payError = ref('')
const payData = ref({
  invoice_id: '',
  student_id: '',
  group_id: '',
  studentName: '',
  original_amount: 0,
  amount: 0,
  discount: 0,
  discount_info: null as any,
  method: 'CASH',
  month: ''
})

const openPayModal = (d: any) => {
  payError.value = ''
  const discountInfo = d.discount_info || null
  const originalAmount = d.amount || 0
  const finalAmount = d.final_amount || d.amount || 0
  payData.value = {
    invoice_id: d._id,
    student_id: d.student?._id,
    group_id: d.group?._id,
    studentName: `${d.student?.user?.firstname} ${d.student?.user?.lastname}`,
    original_amount: originalAmount,
    amount: finalAmount,
    discount: discountInfo?.total_discount || 0,
    discount_info: discountInfo,
    method: 'CASH',
    month: d.month
  }
  showPayModal.value = true
}

const closePayModal = () => {
  showPayModal.value = false
}

const submitPayment = async () => {
  if (submittingPay.value) return
  submittingPay.value = true
  payError.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        student_id: payData.value.student_id,
        group_id: payData.value.group_id,
        amount: payData.value.original_amount || payData.value.amount,
        discount: payData.value.discount || 0,
        payment_method: payData.value.method,
        month: payData.value.month
      }
    })
    
    // Success: ro'yxatdan o'chirish
    // Virtual invoicelarda _id = null bo'ladi, shuning uchun student+group bo'yicha filter
    debtors.value = debtors.value.filter((d: any) => {
      if (d._id && payData.value.invoice_id) {
        return d._id !== payData.value.invoice_id
      }
      // Virtual: student_id va group_id bo'yicha
      return !(
        d.student?._id === payData.value.student_id &&
        d.group?._id === payData.value.group_id &&
        d.month === payData.value.month
      )
    })
    closePayModal()
  } catch (e: any) {
    payError.value = e?.data?.message || "To'lovni amalga oshirishda xatolik"
  } finally {
    submittingPay.value = false
  }
}

const generating = ref(false)
const generateMsg = ref('')

const generateInvoices = async () => {
  generating.value = true
  generateMsg.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>('/api/v1/finance/invoices/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const created = res.data?.created || 0
    const skipped = res.data?.skipped || 0
    generateMsg.value = `✅ ${created} ta yangi invoice yaratildi, ${skipped} ta o'tkazib yuborildi`
    // Qarzdorlar ro'yxatini yangilaymiz
    await fetchDebtors()
  } catch (e: any) {
    generateMsg.value = e?.data?.message || 'Invoice yaratishda xatolik'
  } finally {
    generating.value = false
  }
}

onMounted(fetchDebtors)
</script>
