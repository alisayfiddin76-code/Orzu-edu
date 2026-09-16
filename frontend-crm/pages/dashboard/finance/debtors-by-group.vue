<template>
  <div class="space-y-6">

    <!-- ═══ PAGE HEADER ═══════════════════════════════════════════════════ -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">📂 Guruh bo'yicha Qarzdorlar</h1>
        <p class="text-sm text-slate-400 mt-1">Kunlar bo'yicha guruhlangan qarzdor o'quvchilar</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <button
          @click="generateInvoices"
          :disabled="generating"
          class="text-xs px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="generating" class="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></span>
          {{ generating ? 'Yaratilmoqda...' : '⚡ Invoice Yaratish' }}
        </button>
        <button
          @click="toggleAll"
          class="text-xs px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-semibold transition-colors"
        >
          {{ allExpanded ? "🔼 Yig'ish" : '🔽 Hammasini ochish' }}
        </button>
        <select
          v-model="selectedMonth"
          @change="fetchDebtors"
          class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
    </div>

    <!-- Generate message -->
    <div
      v-if="generateMsg"
      class="p-3 rounded-xl text-xs font-semibold"
      :class="generateMsg.startsWith('✅')
        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'"
    >{{ generateMsg }}</div>

    <!-- ═══ SUMMARY STATS ══════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
        <p class="text-2xl font-black text-rose-400">{{ totalDebtors }}</p>
        <p class="text-xs text-slate-400 mt-1">Jami qarzdor</p>
      </div>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
        <p class="text-2xl font-black text-amber-400">{{ formatMoneyShort(totalDebt) }}</p>
        <p class="text-xs text-slate-400 mt-1">Jami qarzdorlik</p>
      </div>
      <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
        <p class="text-2xl font-black text-indigo-400">{{ visibleGroups.length }}</p>
        <p class="text-xs text-slate-400 mt-1">Guruhlar</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
        <p class="text-2xl font-black text-white">{{ overdueCount }}</p>
        <p class="text-xs text-slate-400 mt-1">Muddati o'tgan</p>
      </div>
    </div>

    <!-- ═══ LOADING / ERROR ════════════════════════════════════════════════ -->
    <div v-if="loading" class="py-16 flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-sm">Yuklanmoqda...</p>
    </div>
    <div v-else-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{{ error }}</div>

    <template v-else>

      <!-- ═══ GLOBAL SEARCH ════════════════════════════════════════════════ -->
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="O'quvchi ismi, telefoni yoki guruh nomi bo'yicha qidirish..."
          class="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs transition-colors"
        >✕</button>
      </div>

      <!-- ═══ DAY TABS (Segmented Control) ════════════════════════════════ -->
      <div class="flex items-stretch gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          @click="activeTab = (tab.value as TabValue); expandedGroups = new Set()"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 relative"
          :class="activeTab === tab.value
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
        >
          <span class="text-base leading-none">{{ tab.icon }}</span>
          <span class="hidden md:inline whitespace-nowrap">{{ tab.label }}</span>
          <span class="md:hidden whitespace-nowrap text-xs">{{ tab.shortLabel }}</span>
          <!-- debtor badge -->
          <span
            v-if="tabDebtorCount(tab.value as TabValue) > 0"
            class="text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center"
            :class="activeTab === tab.value
              ? 'bg-white/25 text-white'
              : 'bg-rose-500/20 text-rose-400'"
          >{{ tabDebtorCount(tab.value as TabValue) }}</span>
        </button>
      </div>

      <!-- Active tab description -->
      <p class="text-xs text-slate-500 -mt-2 px-1">
        {{ TABS.find(t => t.value === activeTab)?.description }}
        <span v-if="visibleGroups.length > 0"> · <span class="text-slate-400">{{ visibleGroups.length }} ta guruh</span></span>
      </p>

      <!-- ═══ EMPTY STATE ════════════════════════════════════════════════ -->
      <div v-if="visibleGroups.length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
        <span class="text-4xl mb-4 block">{{ searchQuery ? '🔍' : '👍' }}</span>
        <p class="text-slate-300 font-semibold">
          {{ searchQuery ? "Qidiruv bo'yicha hech narsa topilmadi" : "Bu kunlarda qarzdorlar yo'q!" }}
        </p>
        <p v-if="!searchQuery" class="text-slate-500 text-sm mt-1">Boshqa tabni tekshiring</p>
      </div>

      <!-- ═══ ACCORDION GROUP CARDS ════════════════════════════════════════ -->
      <div v-else class="space-y-3">
        <div
          v-for="grp in visibleGroups"
          :key="grp.groupId"
          class="rounded-2xl border overflow-hidden"
          :class="grp.debtors.length > 0
            ? 'border-slate-700/50 bg-slate-950/40'
            : 'border-slate-800/30 bg-slate-950/20 opacity-70'"
        >
          <!-- Accordion Header -->
          <button
            @click="toggleGroup(grp.groupId)"
            class="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-900/40 transition-colors text-left"
          >
            <!-- Status stripe -->
            <div
              class="w-1 h-11 rounded-full flex-shrink-0"
              :class="grp.debtors.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'"
            ></div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-white text-[15px]">{{ grp.groupTitle }}</span>

                <!-- Days label badge -->
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md border hidden sm:inline"
                  :class="{
                    'bg-indigo-500/15 border-indigo-500/25 text-indigo-400': grp.days === 'ODD',
                    'bg-violet-500/15 border-violet-500/25 text-violet-400': grp.days === 'EVEN',
                    'bg-teal-500/15 border-teal-500/25 text-teal-400'      : grp.days === 'EVERYDAY',
                    'bg-slate-500/15 border-slate-500/25 text-slate-400'   : grp.days === 'CUSTOM',
                  }"
                >{{ DAY_LABELS[grp.days] || grp.days }}</span>

                <!-- Debtor count badge -->
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  :class="grp.debtors.length > 0
                    ? 'bg-rose-500/15 border-rose-500/25 text-rose-400'
                    : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'"
                >{{ grp.debtors.length > 0 ? `${grp.debtors.length} qarzdor` : "Hamma to'lagan ✓" }}</span>

                <!-- Overdue badge -->
                <span
                  v-if="grp.overdueCount > 0"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-500/10 border-orange-500/20 text-orange-400"
                >⏰ {{ grp.overdueCount }} muddati o'tgan</span>
              </div>

              <p class="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>👨‍🏫 {{ grp.teacherName }}</span>
                <span v-if="grp.room" class="text-slate-600">·</span>
                <span v-if="grp.room">🚪 {{ grp.room }}</span>
                <span v-if="grp.startTime" class="text-slate-600">·</span>
                <span v-if="grp.startTime">⌚ {{ grp.startTime }}–{{ grp.endTime }}</span>
              </p>
            </div>

            <!-- Right: debt total + chevron -->
            <div class="flex items-center gap-3 flex-shrink-0">
              <div v-if="grp.debtors.length > 0" class="text-right hidden sm:block">
                <p class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Jami qarz</p>
                <p class="text-sm font-black text-rose-400">{{ formatMoneyShort(grp.totalDebt) }}</p>
              </div>
              <div
                class="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center transition-transform duration-300"
                :class="expandedGroups.has(grp.groupId) ? 'rotate-180' : ''"
              >
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </button>

          <!-- Accordion Body -->
          <div v-show="expandedGroups.has(grp.groupId)" class="border-t border-slate-800/50">

            <div v-if="grp.debtors.length === 0" class="px-5 py-8 text-center text-slate-500 text-sm">
              <span class="text-3xl block mb-2">✅</span>
              Bu guruhda barcha o'quvchilar to'lovlarini amalga oshirgan.
            </div>

            <template v-else>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-slate-900/60 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800/40">
                    <tr>
                      <th class="px-5 py-3 w-8">#</th>
                      <th class="px-5 py-3">O'quvchi</th>
                      <th class="px-5 py-3">Telefon</th>
                      <th class="px-5 py-3">Summa</th>
                      <th class="px-5 py-3">Kechikdi</th>
                      <th v-if="userRole !== 'TEACHER'" class="px-5 py-3">Amal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/30">
                    <tr
                      v-for="(d, idx) in grp.debtors"
                      :key="d._id || `${d.student?._id}_${grp.groupId}`"
                      class="hover:bg-slate-900/40 transition-colors"
                    >
                      <td class="px-5 py-3.5 text-slate-500 text-xs font-semibold">{{ Number(idx) + 1 }}</td>

                      <td class="px-5 py-3.5">
                        <button
                          @click="openProfileModal(d.student?._id)"
                          class="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors text-left block"
                        >{{ d.student?.user?.firstname }} {{ d.student?.user?.lastname }}</button>
                        <a
                          v-if="d.student?.parentPhone"
                          :href="`tel:${d.student.parentPhone}`"
                          class="text-[10px] text-slate-500 hover:text-indigo-300 mt-0.5 block"
                        >👨‍👩‍👦 {{ d.student.parentPhone }}</a>
                      </td>

                      <td class="px-5 py-3.5">
                        <a :href="`tel:${d.student?.user?.phone}`" class="text-slate-300 hover:text-indigo-300 text-xs transition-colors">
                          📱 {{ d.student?.user?.phone || '—' }}
                        </a>
                      </td>

                      <td class="px-5 py-3.5">
                        <div>
                          <span v-if="d.discount_info?.has_discount" class="text-xs line-through text-slate-500">{{ formatMoney(d.amount) }}</span>
                          <span class="font-bold" :class="d.discount_info?.has_discount ? 'text-amber-400' : 'text-rose-400'">{{ formatMoney(d.final_amount || d.amount) }}</span>
                          <span
                            v-if="d.is_virtual"
                            class="ml-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full inline-block uppercase tracking-wider"
                          >Invoice yo'q</span>
                        </div>
                        <div v-if="d.discount_info?.has_discount" class="flex items-center gap-1 mt-0.5">
                          <span class="text-[10px] text-amber-400">🏷️</span>
                          <span v-if="d.discount_info.auto_discount_amount > 0" class="text-[10px] text-amber-400">Avto −10%</span>
                          <span v-if="d.discount_info.manual_discount_amount > 0" class="text-[10px] text-amber-400">Qo'lda −{{ formatMoney(d.discount_info.manual_discount_amount) }}</span>
                        </div>
                      </td>

                      <td class="px-5 py-3.5">
                        <span
                          v-if="d.days_overdue > 0"
                          class="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full inline-block"
                        >{{ d.days_overdue }} kun</span>
                        <span v-else class="text-xs text-amber-400 font-semibold">Muddati bor</span>
                      </td>

                      <td v-if="userRole !== 'TEACHER'" class="px-5 py-3.5">
                        <button
                          @click="openPayModal(d, grp)"
                          class="text-xs bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors shadow-md shadow-indigo-600/20 whitespace-nowrap"
                        >💳 To'lash</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Group footer -->
              <div class="px-5 py-3 bg-slate-900/30 border-t border-slate-800/30 flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ grp.debtors.length }} ta o'quvchi</span>
                <span class="text-xs font-bold text-rose-400">Jami: {{ formatMoney(grp.totalDebt) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ MODALS ═════════════════════════════════════════════════════════ -->
    <StudentProfileModal v-model="showProfileModal" :studentId="selectedProfileStudentId" />

    <!-- Payment Modal -->
    <Teleport to="body">
      <div
        v-if="showPayModal"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
        @click.self="closePayModal"
      >
        <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden">
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-white">💳 To'lov qabul qilish</h3>
              <p class="text-xs text-slate-400 mt-0.5">{{ payData.groupName }}</p>
            </div>
            <button
              @click="closePayModal"
              class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >✕</button>
          </div>
          <div class="p-6 space-y-5">
            <div v-if="payError" class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">{{ payError }}</div>

            <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">O'quvchi</p>
                  <p class="text-white font-semibold">{{ payData.studentName }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">To'lanadigan summa</p>
                  <p v-if="payData.discount_info?.has_discount" class="text-xs line-through text-slate-500">{{ formatMoney(payData.original_amount) }}</p>
                  <p class="text-xl font-black" :class="payData.discount_info?.has_discount ? 'text-amber-400' : 'text-rose-400'">{{ formatMoney(payData.amount) }}</p>
                </div>
              </div>
              <!-- Chegirma info -->
              <div v-if="payData.discount_info?.has_discount" class="mt-3 pt-3 border-t border-slate-700/50 flex items-start gap-2">
                <span class="text-amber-400 text-sm">🏷️</span>
                <div class="text-xs">
                  <p class="text-amber-300 font-bold mb-0.5">Chegirma qo'llanildi</p>
                  <p v-if="payData.discount_info.auto_discount_amount > 0" class="text-slate-400">Avto (2+ guruh): −{{ formatMoney(payData.discount_info.auto_discount_amount) }}</p>
                  <p v-if="payData.discount_info.manual_discount_amount > 0" class="text-slate-400">Qo'lda: −{{ formatMoney(payData.discount_info.manual_discount_amount) }}</p>
                  <p v-if="payData.discount_info.manual_discount_reason" class="text-slate-500 italic">({{ payData.discount_info.manual_discount_reason }})</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">To'lov usuli</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="m in PAY_METHODS"
                  :key="m.value"
                  @click="payData.method = m.value"
                  :class="[
                    'py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2',
                    payData.method === m.value
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-white'
                  ]"
                >{{ m.icon }} {{ m.label }}</button>
              </div>
            </div>

            <button
              @click="submitPayment"
              :disabled="submittingPay"
              class="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="submittingPay" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ submittingPay ? 'Amalga oshirilmoqda...' : "✅ To'lovni tasdiqlash" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StudentProfileModal from '~/components/StudentProfileModal.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: "Guruh bo'yicha Qarzdorlar — ORZU EDU" })

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TABS = [
  {
    value: 'ODD',
    icon: '1️⃣',
    label: 'Du-Chor-Jum (Toq)',
    shortLabel: 'Du·Chor·Jum',
    description: 'Dushanba, Chorshanba, Juma — toq kunlar guruhlari',
  },
  {
    value: 'EVEN',
    icon: '2️⃣',
    label: 'Se-Pay-Shan (Juft)',
    shortLabel: 'Se·Pay·Shan',
    description: 'Seshanba, Payshanba, Shanba — juft kunlar guruhlari',
  },
  {
    value: 'EVERYDAY',
    icon: '📅',
    label: 'Har kuni',
    shortLabel: 'Har kuni',
    description: "Har kuni dars o'tadigan guruhlar",
  },
  {
    value: 'OTHER',
    icon: '🔧',
    label: 'Boshqa',
    shortLabel: 'Boshqa',
    description: 'Maxsus (Custom) jadvalga ega guruhlar',
  },
]

type TabValue = 'ODD' | 'EVEN' | 'EVERYDAY' | 'OTHER'

const TAB_DAYS_MAP: Record<TabValue, string[]> = {
  ODD:      ['ODD'],
  EVEN:     ['EVEN'],
  EVERYDAY: ['EVERYDAY'],
  OTHER:    ['CUSTOM'],
}

const DAY_LABELS: Record<string, string> = {
  ODD:      'Du-Chor-Jum',
  EVEN:     'Se-Pay-Shan',
  EVERYDAY: 'Har kuni',
  CUSTOM:   'Maxsus',
}

const PAY_METHODS = [
  { value: 'CASH',  icon: '💵', label: 'Naqd' },
  { value: 'CARD',  icon: '💳', label: 'Karta' },
  { value: 'CLICK', icon: '📱', label: 'Click/Payme' },
  { value: 'BANK',  icon: '🏦', label: 'Bank' },
]

// ─── AUTH ────────────────────────────────────────────────────────────────────
const _roleCookie = useCookie('auth_role')
const userRole    = computed(() => _roleCookie.value || 'SUPER_ADMIN')

// ─── STATE ───────────────────────────────────────────────────────────────────
const allDebtors      = ref<any[]>([])
const allActiveGroups = ref<any[]>([])
const loading         = ref(true)
const error           = ref('')
const searchQuery     = ref('')
const generating      = ref(false)
const generateMsg     = ref('')
const activeTab       = ref<TabValue>('ODD')

// Accordion — ALL CLOSED on load; switching tab also resets
const expandedGroups = ref(new Set<string>())

// Profile modal
const showProfileModal         = ref(false)
const selectedProfileStudentId = ref('')
const openProfileModal = (id: string) => {
  selectedProfileStudentId.value = id
  showProfileModal.value = true
}

// Payment modal
const showPayModal  = ref(false)
const submittingPay = ref(false)
const payError      = ref('')
const payData = ref({
  invoice_id: '', student_id: '', group_id: '',
  studentName: '', groupName: '',
  original_amount: 0, amount: 0, discount: 0,
  discount_info: null as any,
  method: 'CASH', month: '',
})

// ─── MONTH ───────────────────────────────────────────────────────────────────
function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const selectedMonth = ref(getCurrentMonth())
const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const monthOptions = computed(() => {
  const opts: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = -1; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ value: val, label: `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}` })
  }
  return opts
})

// ─── FORMATTERS ──────────────────────────────────────────────────────────────
const formatMoney = (v: number) => new Intl.NumberFormat('uz-UZ').format(v || 0) + " so'm"
const formatMoneyShort = (v: number) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' mln'
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + ' ming'
  return (v || 0).toString()
}

// ─── GROUPED DEBTORS ─────────────────────────────────────────────────────────
const groupedDebtors = computed(() => {
  const map = new Map<string, any>()
  
  // 1. Initialize all ACTIVE groups first (so groups with 0 debtors still appear)
  for (const g of allActiveGroups.value) {
    const teacherName = g.teacher
      ? `${g.teacher.firstname || ''} ${g.teacher.lastname || ''}`.trim()
      : "Noma'lum"
      
    map.set(g._id, {
      groupId:     g._id,
      groupTitle:  g.title || "Noma'lum guruh",
      days:        g.days  || 'CUSTOM',
      teacherName,
      room:        g.room       || '',
      startTime:   g.start_time || '',
      endTime:     g.end_time   || '',
      debtors:      [] as any[],
      totalDebt:    0,
      overdueCount: 0,
    })
  }

  // 2. Add debtors into their respective groups
  for (const d of allDebtors.value) {
    const gid = d.group?._id || 'unknown'
    if (!map.has(gid)) {
      const teacher     = d.group?.teacher
      const teacherName = teacher
        ? `${teacher.firstname || ''} ${teacher.lastname || ''}`.trim()
        : "Noma'lum"
      map.set(gid, {
        groupId:     gid,
        groupTitle:  d.group?.title     || "Noma'lum guruh",
        days:        d.group?.days      || 'CUSTOM',
        teacherName,
        room:        d.group?.room       || '',
        startTime:   d.group?.start_time || '',
        endTime:     d.group?.end_time   || '',
        debtors:      [] as any[],
        totalDebt:    0,
        overdueCount: 0,
      })
    }
    const grp = map.get(gid)!
    grp.debtors.push(d)
    grp.totalDebt += d.final_amount || d.amount || 0
    if (d.days_overdue > 0) grp.overdueCount++
  }
  
  return [...map.values()].sort((a, b) => b.debtors.length - a.debtors.length)
})

// ─── TAB FILTER ──────────────────────────────────────────────────────────────
const tabDebtorCount = (tabVal: TabValue) => {
  const allowed = TAB_DAYS_MAP[tabVal]
  return groupedDebtors.value
    .filter(g => allowed.includes(g.days))
    .reduce((s: number, g: any) => s + g.debtors.length, 0)
}

const visibleGroups = computed(() => {
  const allowed = TAB_DAYS_MAP[activeTab.value]
  const q       = searchQuery.value.toLowerCase().trim()

  return groupedDebtors.value
    .filter(grp => allowed.includes(grp.days))
    .map(grp => {
      if (!q) return grp
      const groupMatch =
        grp.groupTitle.toLowerCase().includes(q) ||
        grp.teacherName.toLowerCase().includes(q)
      const filtered = grp.debtors.filter((d: any) => {
        const name  = `${d.student?.user?.firstname || ''} ${d.student?.user?.lastname || ''}`.toLowerCase()
        const phone = (d.student?.user?.phone || '').toLowerCase()
        return name.includes(q) || phone.includes(q)
      })
      if (!groupMatch && filtered.length === 0) return null
      const list = groupMatch ? grp.debtors : filtered
      return {
        ...grp,
        debtors:      list,
        totalDebt:    list.reduce((s: number, d: any) => s + (d.final_amount || d.amount || 0), 0),
        overdueCount: list.filter((d: any) => d.days_overdue > 0).length,
      }
    })
    .filter(Boolean) as any[]
})

// ─── ACCORDION ───────────────────────────────────────────────────────────────
const allExpanded = computed(() =>
  visibleGroups.value.length > 0 &&
  visibleGroups.value.every(g => expandedGroups.value.has(g.groupId))
)
const toggleGroup = (id: string) => {
  const s = new Set(expandedGroups.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedGroups.value = s
}
const toggleAll = () => {
  expandedGroups.value = allExpanded.value
    ? new Set()
    : new Set(visibleGroups.value.map(g => g.groupId))
}

// ─── STATS (global, not tab-filtered) ────────────────────────────────────────
const totalDebtors = computed(() => allDebtors.value.length)
const totalDebt    = computed(() => allDebtors.value.reduce((s, d) => s + (d.final_amount || d.amount || 0), 0))
const overdueCount = computed(() => allDebtors.value.filter(d => d.days_overdue > 0).length)

// ─── API ─────────────────────────────────────────────────────────────────────
const fetchDebtors = async () => {
  loading.value = true
  error.value   = ''
  expandedGroups.value = new Set()    // reset accordion on every fetch
  try {
    const token = useCookie('auth_token')
    
    // 1. Fetch Debtors
    const res = await $fetch<any>(
      `/api/v1/finance/invoices/debtors?month=${selectedMonth.value}`,
      { headers: { Authorization: `Bearer ${token.value}` } }
    )
    allDebtors.value = res.data?.debtors || []
    
    // 2. Fetch Active Groups (to show 0-debtor groups)
    const role = userRole.value
    const groupEndpoint = role === 'TEACHER' ? '/api/v1/groups/my-groups' : '/api/v1/groups'
    const gRes = await $fetch<any>(groupEndpoint, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    allActiveGroups.value = gRes.data?.groups?.filter((g: any) => !g.status || g.status === 'ACTIVE') || []
    
  } catch (e: any) {
    error.value = e?.data?.message || 'Yuklab olishda xatolik'
  } finally {
    loading.value = false
  }
}

const generateInvoices = async () => {
  generating.value = true; generateMsg.value = ''
  try {
    const token = useCookie('auth_token')
    const res   = await $fetch<any>('/api/v1/finance/invoices/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    const created = res.data?.created || 0
    const skipped = res.data?.skipped || 0
    generateMsg.value = `✅ ${created} ta invoice yaratildi, ${skipped} ta o'tkazib yuborildi`
    await fetchDebtors()
  } catch (e: any) {
    generateMsg.value = e?.data?.message || 'Invoice yaratishda xatolik'
  } finally {
    generating.value = false
  }
}

// ─── PAYMENT MODAL ───────────────────────────────────────────────────────────
const openPayModal = (d: any, grp: any) => {
  payError.value = ''
  const discountInfo = d.discount_info || null
  payData.value  = {
    invoice_id:     d._id || '',
    student_id:     d.student?._id,
    group_id:       grp.groupId,
    studentName:    `${d.student?.user?.firstname || ''} ${d.student?.user?.lastname || ''}`.trim(),
    groupName:      grp.groupTitle,
    original_amount: d.amount || 0,
    amount:         d.final_amount || d.amount || 0,
    discount:       discountInfo?.total_discount || 0,
    discount_info:  discountInfo,
    method:         'CASH',
    month:          d.month || selectedMonth.value,
  }
  showPayModal.value = true
}
const closePayModal = () => { showPayModal.value = false }

const submitPayment = async () => {
  if (submittingPay.value) return
  submittingPay.value = true; payError.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/invoices', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        student_id:     payData.value.student_id,
        group_id:       payData.value.group_id,
        amount:         payData.value.original_amount || payData.value.amount,
        discount:       payData.value.discount || 0,
        payment_method: payData.value.method,
        month:          payData.value.month,
      },
    })
    allDebtors.value = allDebtors.value.filter(d => {
      if (d._id && payData.value.invoice_id) return d._id !== payData.value.invoice_id
      return !(
        d.student?._id === payData.value.student_id &&
        d.group?._id   === payData.value.group_id   &&
        d.month        === payData.value.month
      )
    })
    closePayModal()
  } catch (e: any) {
    payError.value = e?.data?.message || "To'lovni amalga oshirishda xatolik"
  } finally {
    submittingPay.value = false
  }
}

// ─── INIT ────────────────────────────────────────────────────────────────────
onMounted(fetchDebtors)
</script>
