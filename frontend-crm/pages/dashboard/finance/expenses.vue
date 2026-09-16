<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">💸 Chiqimlar</h1>
        <p class="text-sm text-slate-400 mt-1">Barcha xarajatlarni kuzatib boring</p>
      </div>
      <button @click="showForm = !showForm" class="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors">
        {{ showForm ? 'Yopish' : '+ Chiqim Qo\'shish' }}
      </button>
    </div>

    <!-- Add Expense Form -->
    <Transition name="slide-down">
      <div v-if="showForm" class="p-6 rounded-2xl bg-slate-950/50 border border-rose-500/20 space-y-4">
        <h3 class="text-sm font-bold text-white">Yangi Chiqim</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Kategoriya *</label>
            <select v-model="form.category" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500">
              <option value="">Tanlang...</option>
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Summa *</label>
            <input v-model.number="form.amount" type="number" placeholder="0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500" />
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Sana</label>
            <input v-model="form.date" type="date" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500" />
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Izoh</label>
            <input v-model="form.note" type="text" placeholder="Ixtiyoriy..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500" />
          </div>
        </div>
        <div v-if="formError" class="text-rose-400 text-xs">{{ formError }}</div>
        <div class="flex justify-end gap-3 pt-2">
          <button @click="showForm = false" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor</button>
          <button @click="submitExpense" :disabled="submitting" class="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50 transition-colors">
            {{ submitting ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Filters -->
    <div class="flex gap-3 flex-wrap">
      <select v-model="filterMonth" @change="fetchExpenses" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500">
        <option value="">Barcha oylar</option>
        <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
      <select v-model="filterCategory" @change="fetchExpenses" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500">
        <option value="">Barcha kategoriyalar</option>
        <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
    </div>

    <!-- Total -->
    <div class="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
      <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Jami chiqim</span>
      <span class="text-xl font-black text-rose-400">{{ formatMoney(total) }}</span>
    </div>

    <!-- Expenses Table -->
    <div v-if="expenses.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th class="px-5 py-4">Kategoriya</th>
            <th class="px-5 py-4">Summa</th>
            <th class="px-5 py-4">Sana</th>
            <th class="px-5 py-4">Izoh</th>
            <th class="px-5 py-4">Qo'shgan</th>
            <th class="px-5 py-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr v-for="exp in expenses" :key="exp._id" class="hover:bg-slate-900/20 transition-colors">
            <td class="px-5 py-4">
              <span class="text-xs font-bold px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">{{ catLabel(exp.category) }}</span>
            </td>
            <td class="px-5 py-4 font-bold text-rose-400">{{ formatMoney(exp.amount) }}</td>
            <td class="px-5 py-4 text-slate-400 text-xs">{{ new Date(exp.date).toLocaleDateString('uz-UZ') }}</td>
            <td class="px-5 py-4 text-slate-500 text-xs">{{ exp.note || '—' }}</td>
            <td class="px-5 py-4 text-slate-500 text-xs">{{ exp.created_by?.firstname }}</td>
            <td class="px-5 py-4">
              <button @click="deleteExpense(exp._id)" class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!loading" class="py-8 text-center text-slate-400 rounded-2xl bg-slate-950/40 border border-slate-800/80">Chiqimlar topilmadi</div>
    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
definePageMeta({ layout: 'admin' })
useHead({ title: 'Chiqimlar — ORZU EDU' })

const expenses = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const total = ref(0)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const filterMonth = ref('')
const filterCategory = ref('')

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const form = reactive({ category: '', amount: 0, date: '', note: '' })

const categories = [
  { value: 'IJARA', label: 'Ijara' }, { value: 'GAZ', label: 'Gaz' },
  { value: 'SVET', label: 'Svet' }, { value: 'INTERNET', label: 'Internet' },
  { value: 'SUV', label: 'Suv' }, { value: 'SOLIQ', label: 'Soliq' },
  { value: 'KITOB', label: 'Kitob' }, { value: 'PRINTER', label: 'Printer' },
  { value: 'REKLAMA', label: 'Reklama' }, { value: 'BONUS', label: 'Bonus' },
  { value: 'JIHOZLAR', label: 'Ofis jihozlari' }, { value: 'TOZALASH', label: 'Tozalash' },
  { value: 'MAOSH', label: 'Maosh' }, { value: 'BOSHQA', label: 'Boshqa' },
]

const catLabel = (val: string) => categories.find(c => c.value === val)?.label || val

const monthOptions = computed(() => {
  const opts = []
  const now = new Date()
  for (let i = -1; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ value: v, label: d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' }) })
  }
  return opts
})

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'

const fetchExpenses = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = useCookie('auth_token')
    let url = '/api/v1/finance/expenses'
    const params = []
    if (filterMonth.value) params.push(`month=${filterMonth.value}`)
    if (filterCategory.value) params.push(`category=${filterCategory.value}`)
    if (params.length) url += '?' + params.join('&')

    const res = await $fetch<any>(url, { headers: { Authorization: `Bearer ${token.value}` } })
    expenses.value = res.data?.expenses || []
    total.value = res.data?.total || 0
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

const submitExpense = async () => {
  if (!form.category || !form.amount) { formError.value = 'Kategoriya va summa majburiy'; return }
  submitting.value = true; formError.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { category: form.category, amount: form.amount, date: form.date || undefined, note: form.note || null }
    })
    form.category = ''; form.amount = 0; form.date = ''; form.note = ''
    showForm.value = false
    await fetchExpenses()
  } catch (e: any) {
    formError.value = e?.data?.message || 'Saqlashda xatolik'
  } finally {
    submitting.value = false
  }
}

const deleteExpense = async (id: string) => {
  if (!confirm("Chiqimni o'chirmoqchisiz?")) return
  try {
    const token = useCookie('auth_token')
    await $fetch(`/api/v1/finance/expenses/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` }
    })
    await fetchExpenses()
  } catch (e: any) {
    error.value = e?.data?.message || "O'chirishda xatolik"
  }
}

onMounted(fetchExpenses)
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
</style>
