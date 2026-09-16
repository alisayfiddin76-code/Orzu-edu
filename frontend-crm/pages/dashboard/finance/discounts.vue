<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">🎁 Chegirmalar</h1>
        <p class="text-sm text-slate-400 mt-1">O'quvchilarga berilgan barcha chegirmalar va imtiyozlar</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
      >
        + Chegirma belgilash
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors">
        <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Jami chegirmali o'quvchilar</p>
        <p class="text-2xl font-extrabold text-white mt-1.5">🎓 {{ stats.totalDiscountStudents }} ta</p>
      </div>
      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors">
        <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Oylik jami chegirma</p>
        <p class="text-2xl font-extrabold text-amber-400 mt-1.5">💰 {{ formatMoney(stats.monthlyDiscountSum) }}</p>
      </div>
      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors">
        <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avtomatik (2+ fan)</p>
        <p class="text-2xl font-extrabold text-indigo-400 mt-1.5">🔄 {{ stats.autoDiscountStudents }} ta</p>
      </div>
      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors">
        <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Qo'lda belgilangan</p>
        <p class="text-2xl font-extrabold text-emerald-400 mt-1.5">✋ {{ stats.manualDiscountStudents }} ta</p>
      </div>
    </div>

    <!-- Discounts Table -->
    <div class="rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-slate-500 text-sm">
        Chegirmalar yuklanmoqda...
      </div>

      <div v-else-if="entries.length === 0" class="p-12 text-center text-slate-500 text-sm">
        Hozircha hech qanday chegirma belgilanmagan.
      </div>

      <table v-else class="w-full text-sm text-left">
        <thead class="bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th class="px-5 py-4">O'quvchi</th>
            <th class="px-5 py-4">Guruh</th>
            <th class="px-5 py-4">Standart narx</th>
            <th class="px-5 py-4">Avto chegirma</th>
            <th class="px-5 py-4">Qo'l chegirma</th>
            <th class="px-5 py-4">Haqiqiy to'lov</th>
            <th class="px-5 py-4">Sabab</th>
            <th class="px-5 py-4">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr
            v-for="entry in entries"
            :key="entry._id"
            class="hover:bg-slate-900/20 transition-colors"
          >
            <td class="px-5 py-4">
              <span class="font-semibold text-white">{{ entry.student?.user?.firstname }} {{ entry.student?.user?.lastname }}</span>
              <p class="text-[10px] text-slate-500 mt-0.5">{{ entry.student?.user?.phone }}</p>
            </td>
            <td class="px-5 py-4 text-slate-300">{{ entry.group?.title }}</td>
            <td class="px-5 py-4 text-slate-300">{{ formatMoney(entry.original_price) }}</td>
            <td class="px-5 py-4">
              <span v-if="entry.auto_discount_amount > 0" class="text-indigo-400 font-semibold">
                -{{ formatMoney(entry.auto_discount_amount) }}
                <span class="text-[10px] text-indigo-500 ml-1">({{ entry.auto_discount_percent }}%)</span>
              </span>
              <span v-else class="text-slate-600">—</span>
            </td>
            <td class="px-5 py-4">
              <span v-if="entry.manual_discount_amount > 0" class="text-emerald-400 font-semibold">
                -{{ formatMoney(entry.manual_discount_amount) }}
              </span>
              <span v-else class="text-slate-600">—</span>
            </td>
            <td class="px-5 py-4">
              <span
                class="font-bold"
                :class="entry.final_price === 0 ? 'text-amber-400' : 'text-white'"
              >
                {{ entry.final_price === 0 ? 'Grant (0)' : formatMoney(entry.final_price) }}
              </span>
            </td>
            <td class="px-5 py-4 text-xs text-slate-400 max-w-[140px] truncate" :title="entry.reason || ''">
              {{ entry.reason || '—' }}
            </td>
            <td class="px-5 py-4">
              <div v-if="entry.manual_discount_id" class="flex items-center gap-1.5">
                <button
                  @click="openEditModal(entry)"
                  class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-colors"
                  title="Tahrirlash"
                >
                  ✏️
                </button>
                <button
                  @click="deleteDiscount(entry.manual_discount_id)"
                  class="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors"
                  title="O'chirish"
                >
                  🗑
                </button>
              </div>
              <span v-else class="text-[10px] text-slate-600 italic">Avtomatik</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: Chegirma belgilash -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAddModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 sm:p-6 overflow-y-auto flex items-start justify-center"
          @click.self="showAddModal = false"
        >
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl p-6 space-y-6 h-auto relative my-8" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">🎁 Chegirma belgilash</h2>
                <p class="text-xs text-slate-500">O'quvchini qidiring va chegirma belgilang</p>
              </div>
              <button @click="showAddModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <!-- Student Search -->
            <div class="space-y-2 relative z-30">
              <label class="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>🔍 O'quvchini izlash</span>
                <span v-if="selectedStudentId" class="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ O'quvchi tanlandi
                </span>
              </label>
              <div class="relative">
                <input
                  v-model="modalSearchQuery"
                  type="text"
                  placeholder="Ism, familiya yoki telefon raqami..."
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 pr-10"
                  @focus="onInputFocus"
                  @blur="hideModalSuggestions"
                />
                <!-- Loading Spinner in input -->
                <div v-if="studentsLoading || calcLoading" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>

              <!-- 3-character Hint Message -->
              <p
                v-if="modalSearchQuery.trim().length > 0 && modalSearchQuery.trim().length < 3"
                class="text-xs text-amber-400 font-medium flex items-center gap-1.5 mt-1"
              >
                <span>ℹ️</span> Kamida 3 ta belgi kiriting...
              </p>

              <!-- Autocomplete Dropdown (z-[9999], position absolute, overflow fix) -->
              <div
                v-if="modalShowSuggestions && (modalFilteredStudents.length > 0 || modalSearchQuery.trim().length >= 3 || (modalSearchQuery.trim().length === 0 && allStudents.length > 0))"
                class="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[9999] divide-y divide-slate-800/80"
              >
                <!-- Initial list header when search query is empty -->
                <div v-if="modalSearchQuery.trim().length === 0" class="px-4 py-2 bg-slate-950/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between sticky top-0 backdrop-blur-sm border-b border-slate-800">
                  <span>📋 Barcha o'quvchilar ro'yxati</span>
                  <span class="text-[10px] text-indigo-400 font-normal">Tanlash uchun bosing</span>
                </div>

                <!-- Students list -->
                <template v-if="modalFilteredStudents.length > 0">
                  <div
                    v-for="student in modalFilteredStudents"
                    :key="student._id"
                    @mousedown.prevent="selectModalStudent(student)"
                    class="px-4 py-3 hover:bg-indigo-600/20 cursor-pointer flex justify-between items-center transition-colors group"
                  >
                    <div>
                      <p class="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {{ student.user?.firstname }} {{ student.user?.lastname }}
                      </p>
                      <p class="text-xs text-slate-400">📞 {{ student.user?.phone || 'Telefon kiritilmagan' }}</p>
                    </div>
                    <span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Faol
                    </span>
                  </div>
                </template>

                <!-- No results found -->
                <div
                  v-else-if="modalSearchQuery.trim().length >= 3 && modalFilteredStudents.length === 0"
                  class="px-4 py-4 text-center text-xs text-slate-400"
                >
                  🔍 Mos keladigan o'quvchi topilmadi.
                </div>
              </div>
            </div>

            <!-- Student Found: Show calculations -->
            <div v-if="calcLoading" class="p-6 text-center text-slate-500 text-xs">
              Hisoblanmoqda...
            </div>

            <div v-if="calcData" class="space-y-4">
              <!-- Student Info -->
              <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/30 flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {{ calcData.student.firstname?.[0] || '?' }}
                </div>
                <div>
                  <p class="text-sm font-bold text-white">{{ calcData.student.firstname }} {{ calcData.student.lastname }}</p>
                  <p class="text-xs text-slate-400">📞 {{ calcData.student.phone }}</p>
                </div>
                <div class="ml-auto text-right">
                  <p class="text-xs text-slate-500">Faol guruhlar: <strong class="text-white">{{ calcData.groupsCount }} ta</strong></p>
                  <p v-if="calcData.autoDiscountPercent > 0" class="text-[10px] text-indigo-400 font-semibold mt-0.5">
                    🔄 Avtomatik {{ calcData.autoDiscountPercent }}% chegirma
                  </p>
                </div>
              </div>

              <!-- Groups Preview Table -->
              <div class="border border-slate-800 rounded-xl overflow-hidden">
                <table class="w-full text-xs">
                  <thead class="bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th class="px-4 py-3 text-left">Guruh</th>
                      <th class="px-4 py-3 text-right">Narx</th>
                      <th class="px-4 py-3 text-right">Avto ({{ calcData.autoDiscountPercent }}%)</th>
                      <th class="px-4 py-3 text-right">Qo'l chegirma</th>
                      <th class="px-4 py-3 text-right">Haqiqiy</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/50">
                    <tr v-for="calc in calcData.calculations" :key="calc.group._id" class="hover:bg-slate-900/20">
                      <td class="px-4 py-3 text-slate-300 font-medium">{{ calc.group.title }}</td>
                      <td class="px-4 py-3 text-right text-slate-400">{{ formatMoney(calc.original_price) }}</td>
                      <td class="px-4 py-3 text-right">
                        <span v-if="calc.auto_discount_amount > 0" class="text-indigo-400">-{{ formatMoney(calc.auto_discount_amount) }}</span>
                        <span v-else class="text-slate-600">—</span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <span v-if="calc.manual_discount_amount > 0" class="text-emerald-400">-{{ formatMoney(calc.manual_discount_amount) }}</span>
                        <span v-else class="text-slate-600">—</span>
                      </td>
                      <td class="px-4 py-3 text-right font-bold text-white">{{ formatMoney(calc.final_price) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-slate-900/30 border-t border-slate-700">
                    <tr>
                      <td class="px-4 py-3 font-bold text-white">Jami:</td>
                      <td class="px-4 py-3 text-right text-slate-400 font-semibold">{{ formatMoney(calcData.summary.totalOriginal) }}</td>
                      <td class="px-4 py-3 text-right text-indigo-400 font-semibold">-{{ formatMoney(calcData.summary.totalDiscount - manualTotalFromCalc) }}</td>
                      <td class="px-4 py-3 text-right text-emerald-400 font-semibold">
                        {{ manualTotalFromCalc > 0 ? '-' + formatMoney(manualTotalFromCalc) : '—' }}
                      </td>
                      <td class="px-4 py-3 text-right text-white font-extrabold text-sm">{{ formatMoney(calcData.summary.totalFinal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Discount Form -->
              <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider">Qo'shimcha chegirma berish</h3>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Guruh tanlang *</label>
                    <select
                      v-model="addForm.group_id"
                      @change="onGroupSelected"
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Tanlang...</option>
                      <option
                        v-for="calc in calcData.calculations"
                        :key="calc.group._id"
                        :value="calc.group._id"
                        :disabled="calc.manual_discount_id !== null"
                      >
                        {{ calc.group.title }} — {{ formatMoney(calc.original_price) }}
                        {{ calc.manual_discount_id ? '(chegirma mavjud)' : '' }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Chegirma summasi (so'm) *</label>
                    <input
                      v-model.number="addForm.discount_amount"
                      type="number"
                      min="0"
                      placeholder="50000"
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <!-- Kalkulyator -->
                <div v-if="addForm.group_id && selectedCalc" class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                  <div class="flex justify-between text-slate-400">
                    <span>Standart narx:</span>
                    <span class="text-white font-semibold">{{ formatMoney(selectedCalc.original_price) }}</span>
                  </div>
                  <div v-if="selectedCalc.auto_discount_amount > 0" class="flex justify-between text-indigo-400">
                    <span>Avto chegirma ({{ selectedCalc.auto_discount_percent }}%):</span>
                    <span class="font-semibold">-{{ formatMoney(selectedCalc.auto_discount_amount) }}</span>
                  </div>
                  <div v-if="addForm.discount_amount > 0" class="flex justify-between text-emerald-400">
                    <span>Qo'l chegirma:</span>
                    <span class="font-semibold">-{{ formatMoney(addForm.discount_amount) }}</span>
                  </div>
                  <div class="border-t border-slate-700 pt-1.5 flex justify-between">
                    <span class="text-white font-bold">To'laydigan summa:</span>
                    <span class="text-lg font-extrabold" :class="computedFinalPrice <= 0 ? 'text-amber-400' : 'text-white'">
                      {{ computedFinalPrice <= 0 ? "Grant (0 so'm)" : formatMoney(computedFinalPrice) }}
                    </span>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Sabab (ixtiyoriy)</label>
                  <textarea
                    v-model="addForm.reason"
                    rows="2"
                    placeholder="Masalan: Ijtimoiy holat, Grant, Aksiya..."
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>

                <div v-if="addError" class="text-rose-400 text-xs">{{ addError }}</div>

                <div class="flex gap-3 justify-end">
                  <button
                    @click="showAddModal = false"
                    class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    @click="submitDiscount"
                    :disabled="submitting || !addForm.group_id || !addForm.discount_amount"
                    class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-colors"
                  >
                    {{ submitting ? 'Saqlanmoqda...' : '💾 Chegirma saqlash' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Chegirmani tahrirlash -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showEditModal && editForm"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 sm:p-6 overflow-y-auto flex items-start justify-center"
          @click.self="showEditModal = false"
        >
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6 h-auto relative my-8" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">✏️ Chegirmani tahrirlash</h2>
                <p class="text-xs text-slate-500">{{ editForm.studentName }} — {{ editForm.groupTitle }}</p>
              </div>
              <button @click="showEditModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Chegirma summasi (so'm) *</label>
                <input
                  v-model.number="editForm.discount_amount"
                  type="number"
                  min="0"
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Sabab (ixtiyoriy)</label>
                <textarea
                  v-model="editForm.reason"
                  rows="2"
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <!-- Preview -->
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <div class="flex justify-between text-slate-400">
                  <span>Standart narx:</span>
                  <span class="text-white font-semibold">{{ formatMoney(editForm.original_price) }}</span>
                </div>
                <div v-if="editForm.auto_discount_amount > 0" class="flex justify-between text-indigo-400">
                  <span>Avto chegirma:</span>
                  <span class="font-semibold">-{{ formatMoney(editForm.auto_discount_amount) }}</span>
                </div>
                <div class="flex justify-between text-emerald-400">
                  <span>Qo'l chegirma:</span>
                  <span class="font-semibold">-{{ formatMoney(editForm.discount_amount || 0) }}</span>
                </div>
                <div class="border-t border-slate-700 pt-1.5 flex justify-between">
                  <span class="text-white font-bold">To'laydigan summa:</span>
                  <span class="text-base font-extrabold text-white">
                    {{ formatMoney(Math.max(0, editForm.original_price - (editForm.auto_discount_amount || 0) - (editForm.discount_amount || 0))) }}
                  </span>
                </div>
              </div>

              <div v-if="editError" class="text-rose-400 text-xs">{{ editError }}</div>

              <div class="flex gap-3 justify-end">
                <button
                  @click="showEditModal = false"
                  class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  @click="submitEditDiscount"
                  :disabled="editSubmitting"
                  class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  {{ editSubmitting ? 'Saqlanmoqda...' : '✅ Saqlash' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })

// ── Data ──
const loading = ref(false)
const entries = ref<any[]>([])
const stats = reactive({
  totalDiscountStudents: 0,
  monthlyDiscountSum: 0,
  autoDiscountStudents: 0,
  manualDiscountStudents: 0,
})

// All students for search
const allStudents = ref<any[]>([])
const studentsLoading = ref(false)

// Add modal
const showAddModal = ref(false)
const modalSearchQuery = ref('')
const modalShowSuggestions = ref(false)
const calcLoading = ref(false)
const calcData = ref<any>(null)
const selectedStudentId = ref('')
const addForm = reactive({
  group_id: '',
  discount_amount: 0,
  reason: '',
})
const addError = ref('')
const submitting = ref(false)

// Edit modal
const showEditModal = ref(false)
const editForm = ref<any>(null)
const editError = ref('')
const editSubmitting = ref(false)

// ── Helpers ──
const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm"

const modalFilteredStudents = computed(() => {
  const query = modalSearchQuery.value.trim().toLowerCase().replace(/[\s+]/g, '')
  
  // Requirement 4: Boshlang'ich ro'yxat (Input focus va query bo'sh bo'lganda)
  if (!query) {
    return allStudents.value.slice(0, 10)
  }

  // Requirement 2: Kamida 3 ta belgi talab qilinadi
  if (query.length < 3) {
    return []
  }

  // 3+ harf yozilganda filter qilish
  return allStudents.value.filter((s: any) => {
    if (!s.user) return false
    const first = (s.user.firstname || '').toLowerCase()
    const last = (s.user.lastname || '').toLowerCase()
    const phone = (s.user.phone || '').replace(/[\s+]/g, '')
    return (
      first.includes(query) ||
      last.includes(query) ||
      phone.includes(query) ||
      `${first}${last}`.includes(query)
    )
  }).slice(0, 15)
})

const hideModalSuggestions = () => setTimeout(() => { modalShowSuggestions.value = false }, 200)

const onInputFocus = () => {
  modalShowSuggestions.value = true
  if (allStudents.value.length === 0) {
    fetchAllStudents()
  }
}

const openAddModal = () => {
  showAddModal.value = true
  modalSearchQuery.value = ''
  modalShowSuggestions.value = false
  selectedStudentId.value = ''
  calcData.value = null
  addError.value = ''
  addForm.group_id = ''
  addForm.discount_amount = 0
  addForm.reason = ''
  if (allStudents.value.length === 0) {
    fetchAllStudents()
  }
}

const selectedCalc = computed(() => {
  if (!calcData.value || !addForm.group_id) return null
  return calcData.value.calculations.find((c: any) => c.group._id === addForm.group_id)
})

const computedFinalPrice = computed(() => {
  if (!selectedCalc.value) return 0
  const price = selectedCalc.value.original_price
  const auto = selectedCalc.value.auto_discount_amount || 0
  const manual = addForm.discount_amount || 0
  return Math.max(0, price - auto - manual)
})

const manualTotalFromCalc = computed(() => {
  if (!calcData.value) return 0
  return calcData.value.calculations.reduce((s: number, c: any) => s + (c.manual_discount_amount || 0), 0)
})

// ── API Calls ──
const fetchDiscounts = async () => {
  loading.value = true
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>('/api/v1/finance/discounts', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    if (res.status === 'success') {
      entries.value = res.data.entries || []
      stats.totalDiscountStudents = res.data.stats.totalDiscountStudents
      stats.monthlyDiscountSum = res.data.stats.monthlyDiscountSum
      stats.autoDiscountStudents = res.data.stats.autoDiscountStudents
      stats.manualDiscountStudents = res.data.stats.manualDiscountStudents
    }
  } catch (err) {
    console.error('Chegirmalar yuklanmadi:', err)
  } finally {
    loading.value = false
  }
}

const fetchAllStudents = async () => {
  studentsLoading.value = true
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(`/api/v1/students?_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    allStudents.value = res.data?.students || []
  } catch (err) {
    console.error('Studentlar yuklanmadi:', err)
  } finally {
    studentsLoading.value = false
  }
}

const selectModalStudent = async (student: any) => {
  modalSearchQuery.value = `${student.user.firstname} ${student.user.lastname}`
  modalShowSuggestions.value = false
  selectedStudentId.value = student._id

  // Reset form
  addForm.group_id = ''
  addForm.discount_amount = 0
  addForm.reason = ''
  addError.value = ''

  // Fetch calculations
  calcLoading.value = true
  calcData.value = null
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(`/api/v1/finance/discounts/student/${student._id}/calculate`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    calcData.value = res.data
  } catch (err: any) {
    addError.value = err?.data?.message || "O'quvchi ma'lumotlarini yuklashda xatolik"
  } finally {
    calcLoading.value = false
  }
}

const onGroupSelected = () => {
  addForm.discount_amount = 0
}

const submitDiscount = async () => {
  if (!selectedStudentId.value || !addForm.group_id || !addForm.discount_amount) return
  submitting.value = true
  addError.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/discounts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        student_id: selectedStudentId.value,
        group_id: addForm.group_id,
        discount_amount: addForm.discount_amount,
        reason: addForm.reason || null,
      },
    })

    alert('Chegirma muvaffaqiyatli belgilandi!')
    showAddModal.value = false
    calcData.value = null
    modalSearchQuery.value = ''
    selectedStudentId.value = ''
    fetchDiscounts()
  } catch (err: any) {
    addError.value = err?.data?.message || 'Chegirma saqlashda xatolik'
  } finally {
    submitting.value = false
  }
}

const openEditModal = (entry: any) => {
  editForm.value = {
    _id: entry.manual_discount_id,
    studentName: `${entry.student?.user?.firstname || ''} ${entry.student?.user?.lastname || ''}`,
    groupTitle: entry.group?.title || '',
    original_price: entry.original_price,
    auto_discount_amount: entry.auto_discount_amount || 0,
    discount_amount: entry.manual_discount_amount,
    reason: entry.reason || '',
  }
  editError.value = ''
  showEditModal.value = true
}

const submitEditDiscount = async () => {
  if (!editForm.value) return
  editSubmitting.value = true
  editError.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch(`/api/v1/finance/discounts/${editForm.value._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        discount_amount: editForm.value.discount_amount,
        reason: editForm.value.reason,
      },
    })

    alert('Chegirma muvaffaqiyatli yangilandi!')
    showEditModal.value = false
    fetchDiscounts()
  } catch (err: any) {
    editError.value = err?.data?.message || 'Yangilashda xatolik'
  } finally {
    editSubmitting.value = false
  }
}

const deleteDiscount = async (id: string) => {
  if (!confirm("Haqiqatan ham bu chegirmani o'chirmoqchimisiz?")) return
  try {
    const token = useCookie('auth_token')
    await $fetch(`/api/v1/finance/discounts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    alert("Chegirma o'chirildi!")
    fetchDiscounts()
  } catch (err: any) {
    alert(err?.data?.message || "O'chirishda xatolik")
  }
}

onMounted(() => {
  fetchDiscounts()
  fetchAllStudents()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
