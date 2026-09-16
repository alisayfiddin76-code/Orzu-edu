<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">👨‍🏫 O'qituvchilar Daromadi</h1>
        <p class="text-sm text-slate-400 mt-1">Har bir o'qituvchining guruhlari, ulushi va avanslari</p>
      </div>
      <select v-model="selectedMonth" @change="fetchTeachers" class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
        <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <div class="w-7 h-7 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="t in teachers"
        :key="t.teacher._id"
        class="rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden"
      >
        <!-- Teacher Header -->
        <div
          class="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/20 transition-colors"
          @click="toggleTeacher(t.teacher._id)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold">
              {{ t.teacher.firstname?.[0] }}
            </div>
            <div>
              <p class="font-bold text-white">{{ t.teacher.firstname }} {{ t.teacher.lastname }}</p>
              <p class="text-xs text-slate-500">{{ t.groups_count }} ta guruh · {{ t.total_students }} ta o'quvchi</p>
            </div>
          </div>
          <div class="text-right flex flex-col items-end gap-2">
            <div>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">💰 Kutilayotgan oylik</p>
              <p class="text-sm font-bold text-slate-400">{{ formatMoney(t.expected_salary) }}</p>
            </div>
            <div>
              <p class="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider mb-0.5">💵 Olish mumkin bo'lgan avans</p>
              <p class="text-lg font-black text-emerald-400">{{ formatMoney(t.available_advance) }}</p>
            </div>
          </div>
        </div>

        <!-- Teacher Details (expanded) -->
        <div v-if="expandedTeacher === t.teacher._id" class="border-t border-slate-800/60 p-5 space-y-4">
          <!-- Stats row -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div class="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p class="text-sm font-black text-slate-300">{{ formatMoneyShort(t.expected_earned) }}</p>
              <p class="text-[10px] text-slate-500">Kutilayotgan daromad</p>
            </div>
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p class="text-sm font-black text-emerald-400">{{ t.paid_count }}</p>
              <p class="text-[10px] text-slate-500">To'lagan</p>
            </div>
            <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p class="text-sm font-black text-rose-400">{{ t.unpaid_count }}</p>
              <p class="text-[10px] text-slate-500">Qarzdor</p>
            </div>
            <div class="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p class="text-sm font-black text-violet-400">{{ formatMoneyShort(t.total_earned) }}</p>
              <p class="text-[10px] text-slate-500">Tushumdan ulush</p>
            </div>
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p class="text-sm font-black text-amber-400">{{ formatMoneyShort(t.total_advance) }}</p>
              <p class="text-[10px] text-slate-500">Avans</p>
            </div>
          </div>

          <!-- Advance form -->
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">💵 Avans berish</h4>
            <div class="flex gap-3">
              <input
                v-model.number="advanceForms[t.teacher._id]"
                type="number"
                :placeholder="`Maks: ${formatMoneyShort(t.remaining)}`"
                class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              />
              <button
                @click="submitAdvance(t)"
                :disabled="givingAdvanceId === t.teacher._id || !advanceForms[t.teacher._id]"
                class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold disabled:opacity-50 transition-colors"
              >
                {{ givingAdvanceId === t.teacher._id ? '...' : 'Berish' }}
              </button>
            </div>
            <div v-if="advanceSuccess[t.teacher._id]" class="text-emerald-400 text-xs">✅ {{ advanceSuccess[t.teacher._id] }}</div>
            <div v-if="advanceError[t.teacher._id]" class="text-rose-400 text-xs">⚠️ {{ advanceError[t.teacher._id] }}</div>
          </div>

          <!-- Salary button -->
          <div class="flex justify-end">
            <button
              @click="paySalary(t.teacher._id, t)"
              :disabled="payingSalaryId === t.teacher._id || t.remaining <= 0"
              class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 transition-colors"
            >
              {{ payingSalaryId === t.teacher._id ? 'Amalga oshirilmoqda...' : `💰 Maosh To'lash (${formatMoneyShort(t.remaining)})` }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="teachers.length === 0" class="py-8 text-center text-slate-400">O'qituvchilar topilmadi</div>
    </div>

    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
definePageMeta({ layout: 'admin' })
useHead({ title: "O'qituvchilar Daromadi — ORZU EDU" })

const teachers = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const expandedTeacher = ref<string | null>(null)
const advanceForms = reactive<Record<string, number>>({})
const advanceSuccess = reactive<Record<string, string>>({})
const advanceError = reactive<Record<string, string>>({})
const givingAdvanceId = ref('')
const payingSalaryId = ref('')

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const selectedMonth = ref(getCurrentMonth())

const monthOptions = computed(() => {
  const opts = [];
  const now = new Date();
  for (let i = -1; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getFullYear()} M${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push({ value: val, label });
  }
  return opts;
});

const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'
const formatMoneyShort = (val: number) => {
  if (!val) return '0'
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' mln'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' ming'
  return val.toString()
}

const toggleTeacher = (id: string) => {
  expandedTeacher.value = expandedTeacher.value === id ? null : id
}

const fetchTeachers = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(
      `/api/v1/finance/teachers?month=${selectedMonth.value}`,
      { headers: { Authorization: `Bearer ${token.value}` } }
    )
    teachers.value = res.data?.teachers || []
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

const submitAdvance = async (t: any) => {
  const teacherId = t.teacher._id
  const amount = advanceForms[teacherId]
  if (!amount || amount <= 0) return
  if (amount > t.remaining) {
    advanceError[teacherId] = `Maksimal avans: ${formatMoney(t.remaining)}`
    return
  }

  givingAdvanceId.value = teacherId
  advanceError[teacherId] = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/advances', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { teacher_id: teacherId, amount, month: selectedMonth.value }
    })
    
    t.expected_salary -= amount
    t.available_advance -= amount
    t.remaining -= amount
    
    advanceSuccess[teacherId] = `${formatMoney(amount)} avans berildi`
    advanceForms[teacherId] = 0
    setTimeout(() => { advanceSuccess[teacherId] = '' }, 3000)
  } catch (e: any) {
    advanceError[teacherId] = e?.data?.message || 'Avans berishda xatolik'
  } finally {
    givingAdvanceId.value = ''
  }
}

const paySalary = async (teacherId: string, t: any) => {
  if (!confirm(`${t.teacher.firstname} ${t.teacher.lastname} uchun ${formatMoney(t.remaining)} maosh to'lanadimi?`)) return
  payingSalaryId.value = teacherId
  try {
    const token = useCookie('auth_token')
    await $fetch(`/api/v1/finance/salary/${teacherId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { month: selectedMonth.value }
    })
    await fetchTeachers()
  } catch (e: any) {
    error.value = e?.data?.message || 'Maosh to\'lashda xatolik'
  } finally {
    payingSalaryId.value = ''
  }
}

onMounted(fetchTeachers)
</script>
