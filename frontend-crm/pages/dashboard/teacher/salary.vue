<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">💰 Maosh va To'lovlar</h1>
        <p class="text-sm text-slate-400 mt-1">O'quvchilar to'lovi va oylik maosh hisobi</p>
      </div>
      <select
        v-model="salaryMonth"
        @change="fetchTeacherSalary"
        class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
      >
        <option v-for="m in salaryMonthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loadingSalary" class="py-16 text-center">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
      <p class="text-slate-500 text-xs mt-3">Ma'lumotlar yuklanmoqda...</p>
    </div>

    <template v-else-if="salaryData">
      <!-- 3 Stat Karta -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Hisoblangan oylik -->
        <div class="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between gap-3 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Hisoblangan oylik</p>
            <span class="text-2xl">💵</span>
          </div>
          <div>
            <p class="text-3xl font-black text-emerald-400">{{ formatMoney(salaryData.total_earned) }}</p>
            <p class="text-[10px] text-slate-500 mt-1">To'langan o'quvchilar asosida hisoblangan</p>
          </div>
          <div class="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
            Kutilayotgan (100% to'lansa):
            <span class="text-slate-300 font-semibold ml-1">{{ formatMoney(salaryData.expected_earned) }}</span>
          </div>
        </div>

        <!-- Olingan avans -->
        <div class="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between gap-3 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Olingan avans</p>
            <span class="text-2xl">📤</span>
          </div>
          <div>
            <p class="text-3xl font-black text-amber-400">{{ formatMoney(salaryData.total_advance) }}</p>
            <p class="text-[10px] text-slate-500 mt-1">{{ salaryData.advances?.length || 0 }} marta olindi</p>
          </div>
          <div class="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
            <template v-if="salaryData.advances?.length">
              Oxirgi avans:
              <span class="text-slate-300 font-semibold ml-1">{{ formatMoney(salaryData.advances[salaryData.advances.length - 1]?.amount) }}</span>
            </template>
            <template v-else>Hali avans olinmagan</template>
          </div>
        </div>

        <!-- Qolgan summa -->
        <div class="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-between gap-3 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Qolgan summa</p>
            <span class="text-2xl">🏦</span>
          </div>
          <div>
            <p class="text-3xl font-black" :class="salaryData.remaining > 0 ? 'text-indigo-400' : 'text-slate-500'">
              {{ formatMoney(salaryData.remaining) }}
            </p>
            <p class="text-[10px] text-slate-500 mt-1">Avans chegirilib, qolgan summa</p>
          </div>
          <div class="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
            O'qituvchi ulushi foizi:
            <span class="text-slate-300 font-semibold ml-1">{{ salaryData.groups?.[0]?.teacher_share_percent || 50 }}%</span>
          </div>
        </div>
      </div>

      <!-- Accordion: Guruhlar kesimida to'lov holati -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">📋 Guruhlar kesimida to'lov holati</h2>
          <span class="text-xs text-slate-500">{{ salaryData.groups?.length || 0 }} ta guruh</span>
        </div>

        <div
          v-for="group in salaryData.groups"
          :key="group.group_id"
          class="rounded-xl border overflow-hidden transition-all duration-200"
          :class="openGroupId === group.group_id
            ? 'border-indigo-500/40 bg-slate-950/70'
            : 'border-slate-800 bg-slate-950/40'"
        >
          <!-- Accordion Header -->
          <button
            @click="toggleGroup(group.group_id)"
            class="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-900/40 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-lg">👥</span>
              <div class="text-left min-w-0">
                <p class="font-bold text-sm text-white truncate">{{ group.title }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">
                  {{ group.course }} • {{ group.total_students }} o'quvchi
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <div class="hidden sm:flex items-center gap-3 text-xs">
                <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  {{ group.paid_count }} ta to'lagan
                </span>
                <span class="text-slate-700">|</span>
                <span class="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                  {{ group.unpaid_count }} ta qarzdor
                </span>
              </div>
              <span
                class="text-slate-400 text-xs transition-transform duration-200"
                :class="openGroupId === group.group_id ? 'rotate-180' : ''"
              >▼</span>
            </div>
          </button>

          <!-- Accordion Body -->
          <div v-if="openGroupId === group.group_id" class="border-t border-slate-800">
            <!-- Progress bar -->
            <div class="px-5 py-3 bg-slate-900/30">
              <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                <span>To'lash darajasi</span>
                <span class="font-bold text-white">
                  {{ group.total_students > 0 ? Math.round((group.paid_count / group.total_students) * 100) : 0 }}%
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  :style="{ width: group.total_students > 0 ? (group.paid_count / group.total_students * 100) + '%' : '0%' }"
                ></div>
              </div>
            </div>

            <!-- O'quvchilar -->
            <div v-if="!group.students_detail || group.students_detail.length === 0"
              class="px-5 py-8 text-center text-xs text-slate-500">
              Bu oyda hech qanday invoice yaratilmagan
            </div>
            <div v-else class="divide-y divide-slate-800/60">
              <div
                v-for="s in group.students_detail"
                :key="s.student_id"
                @click="openStudentModal(s, group.title)"
                class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors cursor-pointer group/row"
              >
                <div class="flex items-center gap-3">
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    :class="{
                      'bg-emerald-500/20 text-emerald-400': s.status === 'PAID',
                      'bg-rose-500/20 text-rose-400': s.status === 'UNPAID',
                      'bg-slate-800 text-slate-500': s.status === 'NO_INVOICE'
                    }"
                  >
                    {{ (s.firstname?.[0] || '?').toUpperCase() }}{{ (s.lastname?.[0] || '').toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white group-hover/row:text-indigo-300 transition-colors">
                      {{ s.firstname }} {{ s.lastname }}
                    </p>
                    <p class="text-[10px] text-slate-500">{{ s.phone || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <span
                      class="text-xs font-bold px-2.5 py-1 rounded-full"
                      :class="{
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': s.status === 'PAID',
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20': s.status === 'UNPAID',
                        'bg-slate-800 text-slate-500 border border-slate-700': s.status === 'NO_INVOICE'
                      }"
                    >
                      {{ s.status === 'PAID' ? '✅ To\'langan' : s.status === 'UNPAID' ? '❌ Qarzdor' : '— Invoice yo\'q' }}
                    </span>
                    <p v-if="s.amount > 0" class="text-[10px] text-slate-400 mt-0.5 text-right">{{ formatMoney(s.amount) }}</p>
                  </div>
                  <!-- Arrow hint -->
                  <span class="text-slate-600 text-xs group-hover/row:text-slate-400 transition-colors">›</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-5 py-3 bg-slate-900/20 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">O'qituvchi ulushi ({{ group.teacher_share_percent }}%)</span>
              <span class="font-bold text-white">{{ formatMoney(group.teacher_share) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Bo'sh holat -->
    <div v-else-if="!loadingSalary"
      class="py-16 text-center bg-slate-950/40 rounded-2xl border border-slate-800 border-dashed">
      <span class="text-4xl block mb-3">📭</span>
      <p class="text-slate-400 font-medium">Bu oy uchun maosh ma'lumotlari mavjud emas</p>
      <p class="text-xs text-slate-600 mt-1">Guruhlaringizda hali invoice yaratilmagan bo'lishi mumkin</p>
    </div>

    <!-- ─── O'QUVCHI BATAFSIL MODAL ─── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="selectedStudent"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="selectedStudent = null"
        >
          <div
            class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div class="flex items-center gap-4">
                <!-- Big avatar -->
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
                  :class="{
                    'bg-emerald-500/20 text-emerald-400': selectedStudent.status === 'PAID',
                    'bg-rose-500/20 text-rose-400': selectedStudent.status === 'UNPAID',
                    'bg-slate-800 text-slate-400': selectedStudent.status === 'NO_INVOICE'
                  }"
                >
                  {{ (selectedStudent.firstname?.[0] || '?').toUpperCase() }}{{ (selectedStudent.lastname?.[0] || '').toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">
                    {{ selectedStudent.firstname }} {{ selectedStudent.lastname }}
                  </h3>
                  <p class="text-xs text-slate-400">{{ selectedStudentGroup }}</p>
                </div>
              </div>
              <button
                @click="selectedStudent = null"
                class="text-slate-500 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
              >✕</button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- To'lov holati badge (katta) -->
              <div
                class="flex items-center justify-between p-4 rounded-xl border"
                :class="{
                  'bg-emerald-500/10 border-emerald-500/20': selectedStudent.status === 'PAID',
                  'bg-rose-500/10 border-rose-500/20': selectedStudent.status === 'UNPAID',
                  'bg-slate-900 border-slate-700': selectedStudent.status === 'NO_INVOICE'
                }"
              >
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-wider"
                    :class="{
                      'text-emerald-500': selectedStudent.status === 'PAID',
                      'text-rose-500': selectedStudent.status === 'UNPAID',
                      'text-slate-500': selectedStudent.status === 'NO_INVOICE'
                    }"
                  >
                    {{ salaryMonth }} — To'lov holati
                  </p>
                  <p class="text-2xl font-black mt-1"
                    :class="{
                      'text-emerald-400': selectedStudent.status === 'PAID',
                      'text-rose-400': selectedStudent.status === 'UNPAID',
                      'text-slate-500': selectedStudent.status === 'NO_INVOICE'
                    }"
                  >
                    {{ selectedStudent.status === 'PAID' ? '✅ To\'langan' : selectedStudent.status === 'UNPAID' ? '❌ Qarzdor' : '— Invoice yo\'q' }}
                  </p>
                </div>
                <div v-if="selectedStudent.amount > 0" class="text-right">
                  <p class="text-[10px] text-slate-500">Summa</p>
                  <p class="text-xl font-black text-white">{{ formatMoney(selectedStudent.amount) }}</p>
                </div>
              </div>

              <!-- Info rows -->
              <div class="space-y-3">
                <div v-if="selectedStudent.phone" class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-sm flex-shrink-0">📱</span>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">Telefon raqami</p>
                    <a :href="`tel:${selectedStudent.phone}`"
                      class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                      {{ selectedStudent.phone }}
                    </a>
                  </div>
                </div>

                <div v-if="selectedStudent.parentPhone" class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-sm flex-shrink-0">👨‍👩‍👦</span>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">Ota-ona telefoni</p>
                    <a :href="`tel:${selectedStudent.parentPhone}`"
                      class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                      {{ selectedStudent.parentPhone }}
                    </a>
                  </div>
                </div>

                <div v-if="selectedStudent.email" class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-sm flex-shrink-0">✉️</span>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">Email</p>
                    <p class="text-sm font-semibold text-white">{{ selectedStudent.email }}</p>
                  </div>
                </div>

                <div v-if="selectedStudent.paid_at" class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-sm flex-shrink-0">📅</span>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">To'langan sana</p>
                    <p class="text-sm font-semibold text-white">{{ formatDate(selectedStudent.paid_at) }}</p>
                  </div>
                </div>

                <div v-if="selectedStudent.payment_method" class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-sm flex-shrink-0">💳</span>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">To'lov usuli</p>
                    <p class="text-sm font-semibold text-white">{{ paymentMethodLabel(selectedStudent.payment_method) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-slate-800 flex gap-3">
              <a
                v-if="selectedStudent.phone"
                :href="`tel:${selectedStudent.phone}`"
                class="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
              >
                📞 Qo'ng'iroq qilish
              </a>
              <button
                @click="selectedStudent = null"
                class="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 font-semibold text-sm transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: "Maosh va To'lovlar — ORZU EDU" })

// ─── State ───────────────────────────────────────────────────
const loadingSalary = ref(false)
const salaryData = ref<any>(null)
const openGroupId = ref<string | null>(null)

// Student modal
const selectedStudent = ref<any>(null)
const selectedStudentGroup = ref('')

const openStudentModal = (student: any, groupTitle: string) => {
  selectedStudent.value = student
  selectedStudentGroup.value = groupTitle
}

// ─── Month Picker ─────────────────────────────────────────────
function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const salaryMonth = ref(getCurrentMonth())

const salaryMonthOptions = computed(() => {
  const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
  const opts: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = -1; i < 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ value: val, label: `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}` })
  }
  return opts
})

// ─── Helpers ─────────────────────────────────────────────────
const formatMoney = (val: number) => {
  if (!val) return "0 so'm"
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " mln so'm"
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm"
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const paymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CASH: '💵 Naqd pul',
    CARD: '💳 Karta',
    CLICK: '📲 Click',
    BANK: '🏦 Bank o\'tkazmasi'
  }
  return labels[method] || method
}

const toggleGroup = (groupId: string) => {
  openGroupId.value = openGroupId.value === groupId ? null : groupId
}

// ─── Fetch ───────────────────────────────────────────────────
const fetchTeacherSalary = async () => {
  loadingSalary.value = true
  salaryData.value = null
  try {
    const token = useCookie('auth_token').value
    const myId = useCookie('auth_id').value || ''
    if (!myId) return
    const res: any = await $fetch(
      `/api/v1/finance/teachers/${myId}/summary?month=${salaryMonth.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    salaryData.value = res?.data || null
  } catch (err) {
    console.error("Maosh ma'lumotlarini yuklashda xatolik:", err)
  } finally {
    loadingSalary.value = false
  }
}

onMounted(fetchTeacherSalary)
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .bg-slate-950,
.modal-fade-leave-active .bg-slate-950 {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from .bg-slate-950 {
  transform: scale(0.95) translateY(8px);
}
</style>
