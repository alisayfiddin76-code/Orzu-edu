<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">👨‍🎓 O''quvchi To''lovi</h1>
        <p class="text-sm text-slate-400 mt-1">O''quvchini qidiring va to''lov qabul qiling</p>
      </div>
    </div>

    <!-- Search -->
    <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
      <h2 class="text-sm font-bold text-white">🔍 O''quvchini qidirish</h2>
      <div class="flex gap-3 relative">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="O''quvchi ism, familiyasi yoki telefon raqami..."
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
            @keyup.enter="searchStudent"
          />
          <!-- Autocomplete Dropdown -->
          <div
            v-if="showSuggestions && filteredStudents.length > 0 && searchQuery.length > 0"
            class="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800"
          >
            <div
              v-for="student in filteredStudents"
              :key="student._id"
              @mousedown.prevent="selectStudent(student)"
              class="px-4 py-3 hover:bg-indigo-600/20 cursor-pointer flex justify-between items-center transition-colors"
            >
              <div>
                <p class="text-sm font-bold text-white">{{ student.user?.firstname }} {{ student.user?.lastname }}</p>
                <p class="text-xs text-slate-400">📞 {{ student.user?.phone }}</p>
              </div>
              <span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Faol</span>
            </div>
          </div>
        </div>
        <select v-model="selectedMonth" class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <button @click="searchStudent" :disabled="searching" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
          {{ searching ? 'Qidirilmoqda...' : 'Qidirish' }}
        </button>
      </div>
      <div v-if="searchError" class="text-rose-400 text-xs">{{ searchError }}</div>
    </div>

    <!-- Student Info + Invoices -->
    <div v-if="studentData" class="space-y-4">
      <!-- Student Card -->
      <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-950/80 border border-indigo-800/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {{ studentData.student?.user?.firstname?.[0] }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ studentData.student?.user?.firstname }} {{ studentData.student?.user?.lastname }}</h3>
            <p class="text-xs text-slate-400">📞 {{ studentData.student?.user?.phone }}</p>
          </div>
          <div class="ml-auto text-right">
            <span class="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">{{ selectedMonth }}</span>
          </div>
        </div>
      </div>

      <!-- Invoices per group -->
      <div v-for="item in studentData.invoices" :key="item.group._id" class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
        <!-- Group Header -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-indigo-400 font-bold uppercase tracking-wider">{{ item.group.course?.title }}</p>
            <h3 class="text-base font-bold text-white">{{ item.group.title }}</h3>
            <p class="text-xs text-slate-500">O''qituvchi: {{ item.group.teacher?.firstname }} {{ item.group.teacher?.lastname }}</p>
          </div>
          <div class="text-right">
            <span v-if="item.invoice?.invoice_type === 'PRORATED'" class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20 block mb-1">📅 Prorated</span>
            <p class="text-lg font-black text-white">{{ formatMoney(item.amount) }}</p>
            <span v-if="item.invoice" :class="statusClass(item.invoice.status)" class="text-[10px] font-bold px-2 py-0.5 rounded-full border">{{ statusLabel(item.invoice.status) }}</span>
            <span v-else class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700">Invoice yo''q</span>
          </div>
        </div>

        <!-- PRORATED A/B VARIANT PANEL -->
        <div
          v-if="(!item.invoice || item.invoice.status !== 'PAID') && proratedData[item.group._id] && !proratedData[item.group._id].is_first_day"
          class="border border-amber-500/30 rounded-2xl bg-amber-500/5 p-4 space-y-4"
        >
          <div class="flex items-center gap-2">
            <span class="text-amber-400 text-lg">📅</span>
            <div>
              <p class="text-sm font-bold text-amber-300">Prorated Billing — To''lov Varianti Tanlang</p>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ proratedData[item.group._id].days_remaining }} kun qolgan
                ({{ proratedData[item.group._id].current_month }}, {{ proratedData[item.group._id].days_in_month }} kunli oy)
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              @click="payForms[item.group._id].selectedVariant = 'A'"
              :class="['p-4 rounded-xl border-2 text-left transition-all w-full', payForms[item.group._id].selectedVariant === 'A' ? 'border-indigo-500 bg-indigo-600/15' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600']"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">A-Variant</span>
                <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', payForms[item.group._id].selectedVariant === 'A' ? 'border-indigo-400' : 'border-slate-600']">
                  <div v-if="payForms[item.group._id].selectedVariant === 'A'" class="w-2 h-2 rounded-full bg-indigo-400"></div>
                </div>
              </div>
              <p class="text-xl font-black text-white mb-1">{{ formatMoney(proratedData[item.group._id].variant_a?.amount) }}</p>
              <p class="text-xs text-slate-400">{{ proratedData[item.group._id].variant_a?.description }}</p>
              <p class="text-[10px] text-slate-500 mt-2">⏭ Keyingi to''lov: <span class="text-slate-300 font-semibold">{{ proratedData[item.group._id].variant_a?.next_billing_month }}</span></p>
            </button>

            <button
              @click="payForms[item.group._id].selectedVariant = 'B'"
              :class="['p-4 rounded-xl border-2 text-left transition-all w-full', payForms[item.group._id].selectedVariant === 'B' ? 'border-emerald-500 bg-emerald-600/15' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600']"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">B-Variant</span>
                <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', payForms[item.group._id].selectedVariant === 'B' ? 'border-emerald-400' : 'border-slate-600']">
                  <div v-if="payForms[item.group._id].selectedVariant === 'B'" class="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              <p class="text-xl font-black text-white mb-1">{{ formatMoney(proratedData[item.group._id].variant_b?.amount) }}</p>
              <p class="text-xs text-slate-400">{{ proratedData[item.group._id].variant_b?.description }}</p>
              <div class="mt-2 space-y-0.5">
                <p class="text-[10px] text-slate-500">🟡 Prorated: <span class="text-amber-400 font-semibold">{{ formatMoney(proratedData[item.group._id].variant_b?.prorated_part) }}</span></p>
                <p class="text-[10px] text-slate-500">🟢 To''liq oy: <span class="text-emerald-400 font-semibold">{{ formatMoney(proratedData[item.group._id].variant_b?.full_month_part) }}</span></p>
                <p class="text-[10px] text-slate-500">⏭ Keyingi to''lov: <span class="text-slate-300 font-semibold">{{ proratedData[item.group._id].variant_b?.next_billing_month }}</span></p>
              </div>
            </button>
          </div>

          <div v-if="payForms[item.group._id].selectedVariant" class="space-y-3 border-t border-slate-700/50 pt-3">
            <div>
              <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">To''lov usuli *</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method.value"
                  @click="payForms[item.group._id].method = method.value"
                  :class="['py-2 rounded-xl text-xs font-bold border transition-all', payForms[item.group._id].method === method.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-500/50']"
                >{{ method.label }}</button>
              </div>
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Izoh</label>
              <input v-model="payForms[item.group._id].note" type="text" placeholder="Ixtiyoriy..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div :class="payForms[item.group._id].selectedVariant === 'B' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-indigo-500/20 bg-indigo-500/5'" class="p-3 rounded-xl border">
              <p class="text-xs text-slate-400">To''lanadigan summa ({{ payForms[item.group._id].selectedVariant }}-variant):</p>
              <p class="text-xl font-black mt-1" :class="payForms[item.group._id].selectedVariant === 'B' ? 'text-emerald-400' : 'text-indigo-400'">
                {{ payForms[item.group._id].selectedVariant === 'A' ? formatMoney(proratedData[item.group._id]?.variant_a?.amount) : formatMoney(proratedData[item.group._id]?.variant_b?.amount) }}
              </p>
            </div>
            <button
              @click="submitProratedPayment(item)"
              :disabled="!payForms[item.group._id].method || payingGroupId === item.group._id"
              :class="payForms[item.group._id].selectedVariant === 'B' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'"
              class="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-colors"
            >
              {{ payingGroupId === item.group._id ? 'Saqlanmoqda...' : `✅ ${payForms[item.group._id].selectedVariant}-Variant To'lovini Qabul Qilish` }}
            </button>
          </div>
        </div>

        <!-- Odatiy to'lov formasi -->
        <div v-if="(!item.invoice || item.invoice.status !== 'PAID') && (!proratedData[item.group._id] || proratedData[item.group._id].is_first_day)" class="border-t border-slate-800/60 pt-4 space-y-3">

          <!-- Chegirma ma'lumoti (agar mavjud bo'lsa) -->
          <div
            v-if="item.discount_info?.has_discount"
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <span class="text-amber-400 text-sm">🏷️</span>
            <div class="flex-1 text-xs">
              <span class="text-amber-300 font-bold">Chegirma:</span>
              <span v-if="item.discount_info.auto_discount_amount > 0" class="text-slate-300 ml-1">Avto (2+ guruh) −{{ formatMoney(item.discount_info.auto_discount_amount) }}</span>
              <span v-if="item.discount_info.manual_discount_amount > 0" class="text-slate-300 ml-1"><span v-if="item.discount_info.auto_discount_amount > 0">+</span> Qo'lda −{{ formatMoney(item.discount_info.manual_discount_amount) }}</span>
              <span v-if="item.discount_info.manual_discount_reason" class="text-slate-500 ml-1">({{ item.discount_info.manual_discount_reason }})</span>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500 line-through">{{ formatMoney(item.amount) }}</p>
              <p class="text-sm font-black text-amber-400">{{ formatMoney(item.discount_info.discounted_price) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Summa</label>
              <input v-model.number="payForms[item.group._id].amount" type="number" :placeholder="item.amount.toString()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Chegirma</label>
              <input v-model.number="payForms[item.group._id].discount" type="number" placeholder="0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">To'lov usuli *</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                @click="payForms[item.group._id].method = method.value"
                :class="['py-2 rounded-xl text-xs font-bold border transition-all', payForms[item.group._id].method === method.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-500/50']"
              >{{ method.label }}</button>
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Izoh</label>
            <input v-model="payForms[item.group._id].note" type="text" placeholder="Ixtiyoriy..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p class="text-xs text-slate-400">To'lanadigan summa:</p>
            <p class="text-xl font-black text-emerald-400">{{ formatMoney((payForms[item.group._id].amount || item.amount) - (payForms[item.group._id].discount || 0)) }}</p>
          </div>
          <button @click="submitPayment(item)" :disabled="!payForms[item.group._id].method || payingGroupId === item.group._id" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm disabled:opacity-50 transition-colors">
            {{ payingGroupId === item.group._id ? 'Saqlanmoqda...' : "✅ To'lovni Qabul Qilish" }}
          </button>
        </div>

        <!-- Already paid -->
        <div v-else class="border-t border-slate-800/60 pt-3 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">✅</div>
          <div class="text-xs text-slate-400">
            <span class="text-emerald-400 font-bold">To''langan</span> —
            {{ item.invoice.paid_at ? new Date(item.invoice.paid_at).toLocaleDateString('uz-UZ') : '' }}
            <span v-if="item.invoice.invoice_type === 'PRORATED'" class="ml-2 text-amber-400 font-semibold">(Prorated)</span>
          </div>
        </div>
      </div>

      <div v-if="paySuccess" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">✅ {{ paySuccess }}</div>
      <div v-if="payError" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">⚠️ {{ payError }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
definePageMeta({ layout: 'admin' })
useHead({ title: "O'quvchi To'lovi — ORZU EDU" })

const searchQuery = ref('')
const searchPhone = ref('')
const showSuggestions = ref(false)
const allStudents = ref<any[]>([])
const selectedMonth = ref(getCurrentMonth())
const searching = ref(false)
const searchError = ref('')
const studentData = ref<any>(null)
const payForms = reactive<Record<string, any>>({})
const proratedData = reactive<Record<string, any>>({})
const payingGroupId = ref('')
const paySuccess = ref('')
const payError = ref('')

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const monthOptions = computed(() => {
  const opts: any[] = []
  const now = new Date()
  for (let i = -1; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
    opts.push({ value: val, label })
  }
  return opts
})

const paymentMethods = [
  { value: 'CASH', label: 'Naqd' },
  { value: 'CARD', label: 'Karta' },
  { value: 'CLICK', label: 'Click' },
  { value: 'BANK', label: 'Bank' },
]

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm"
const statusClass = (status: string) => {
  if (status === 'PAID') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (status === 'UNPAID') return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  if (status === 'CANCELLED') return 'bg-slate-700/50 text-slate-400 border-slate-600'
  return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
}
const statusLabel = (status: string) => {
  if (status === 'PAID') return "✅ To'langan"
  if (status === 'UNPAID') return "❌ To'lanmagan"
  if (status === 'CANCELLED') return '⛔ Bekor qilingan'
  return status
}

const fetchAllStudents = async () => {
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(`/api/v1/students?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token.value}` } })
    allStudents.value = res.data?.students || []
  } catch (e) { console.error('Studentlarni yuklashda xatolik', e) }
}

const filteredStudents = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase().replace(/[\s+]/g, '')
  return allStudents.value.filter(s => {
    if (!s.user) return false
    const first = (s.user.firstname || '').toLowerCase()
    const last = (s.user.lastname || '').toLowerCase()
    const phone = (s.user.phone || '').replace(/[\s+]/g, '')
    return first.includes(query) || last.includes(query) || phone.includes(query) || `${first}${last}`.includes(query)
  }).slice(0, 10)
})

const hideSuggestions = () => setTimeout(() => { showSuggestions.value = false }, 150)
const selectStudent = (student: any) => {
  searchQuery.value = `${student.user.firstname} ${student.user.lastname}`
  searchPhone.value = student.user.phone
  showSuggestions.value = false
  searchStudent()
}

const fetchProratedPreviews = async (invoicesData: any[], studentId: string) => {
  const token = useCookie('auth_token')
  for (const item of invoicesData) {
    if (!item.invoice || item.invoice.status !== 'PAID') {
      try {
        const res = await $fetch<any>(`/api/v1/finance/prorated-preview?student_id=${studentId}&group_id=${item.group._id}`, { headers: { Authorization: `Bearer ${token.value}` } })
        proratedData[item.group._id] = res.data
        if (!res.data.is_first_day && payForms[item.group._id]) payForms[item.group._id].selectedVariant = 'A'
      } catch (e) { console.error('Prorated preview xatolik:', e) }
    }
  }
}

const searchStudent = async () => {
  let phoneToSearch = searchPhone.value
  if (!phoneToSearch && searchQuery.value) {
    const cleanQ = searchQuery.value.replace(/[\s+]/g, '')
    if (/\d{9,}/.test(cleanQ)) {
      phoneToSearch = cleanQ
    } else {
      const matched = allStudents.value.find(s => {
        const first = (s.user?.firstname || '').toLowerCase()
        const last = (s.user?.lastname || '').toLowerCase()
        const q = searchQuery.value.toLowerCase()
        return first.includes(q) || last.includes(q)
      })
      if (matched) phoneToSearch = matched.user?.phone || ''
      else { searchError.value = "Kiritilgan ma'lumot bo'yicha o'quvchi topilmadi"; return }
    }
  }
  if (!phoneToSearch) return
  searching.value = true
  searchError.value = ''
  studentData.value = null
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(`/api/v1/finance/invoices/search?phone=${phoneToSearch}&month=${selectedMonth.value}`, { headers: { Authorization: `Bearer ${token.value}` } })
    studentData.value = res.data
    for (const item of res.data.invoices) {
      const discountInfo = item.discount_info
      payForms[item.group._id] = {
        amount: item.amount,
        discount: discountInfo?.total_discount || 0,
        method: '',
        note: '',
        selectedVariant: null
      }
    }
    await fetchProratedPreviews(res.data.invoices, res.data.student._id)
  } catch (e: any) {
    searchError.value = e?.data?.message || "O'quvchi topilmadi"
  } finally {
    searching.value = false
  }
}

onMounted(() => { fetchAllStudents() })

const submitProratedPayment = async (item: any) => {
  const form = payForms[item.group._id]
  if (!form.method || !form.selectedVariant) return
  payingGroupId.value = item.group._id
  payError.value = ''
  paySuccess.value = ''
  const preview = proratedData[item.group._id]
  const amount = form.selectedVariant === 'A' ? preview?.variant_a?.amount : preview?.variant_b?.amount
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/invoices/sync-billing', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { student_id: studentData.value.student._id, group_id: item.group._id, variant: form.selectedVariant, payment_method: form.method, amount, discount: form.discount || 0, note: form.note || null }
    })
    const msg = form.selectedVariant === 'A' ? "A-Variant: Joriy oy qoldig'i to'landi. Keyingi oyda invoice yaratiladi." : "B-Variant: Joriy oy + keyingi oy to'landi. Keyingi oyda invoice yaratilmaydi."
    paySuccess.value = `✅ ${item.group.title}: ${msg}`
    await searchStudent()
    setTimeout(() => { paySuccess.value = '' }, 6000)
  } catch (e: any) {
    payError.value = e?.data?.message || "To'lovni saqlashda xatolik"
  } finally { payingGroupId.value = '' }
}

const submitPayment = async (item: any) => {
  const form = payForms[item.group._id]
  if (!form.method) return
  payingGroupId.value = item.group._id
  payError.value = ''
  paySuccess.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { student_id: studentData.value.student._id, group_id: item.group._id, month: selectedMonth.value, amount: form.amount || item.amount, discount: form.discount || 0, payment_method: form.method, note: form.note || null }
    })
    paySuccess.value = `To'lov qabul qilindi: ${item.group.title}`
    await searchStudent()
    setTimeout(() => { paySuccess.value = '' }, 4000)
  } catch (e: any) {
    payError.value = e?.data?.message || "To'lovni saqlashda xatolik"
  } finally { payingGroupId.value = '' }
}
</script>
