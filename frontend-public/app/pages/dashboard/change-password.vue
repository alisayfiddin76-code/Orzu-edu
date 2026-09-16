<template>
  <div class="min-h-screen py-8 px-4 sm:px-6">
    <div class="max-w-lg mx-auto space-y-6">

      <!-- Header: Premium Brand Design -->
      <div class="relative overflow-hidden rounded-3xl bg-brand-primary border-b-4 border-brand-accent p-6 sm:p-8 shadow-xl shadow-brand-primary/10">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-accent/10 blur-2xl"></div>
        
        <div class="relative z-10">
          <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 text-[#94B0C7] hover:text-white text-sm font-bold transition-all duration-300 mb-6 group">
            <span class="group-hover:-translate-x-1 transition-transform duration-300">←</span> Kabinetga qaytish
          </NuxtLink>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent border border-brand-accent/30 mb-4">
            Shaxsiy Ma'lumotlar
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">🔐</span> Parolni O'zgartirish
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">Xavfsizligingiz uchun parolingizni yangilang</p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">

        <!-- Current Password -->
        <div>
          <label class="text-xs font-black text-brand-textSecondary uppercase tracking-widest block mb-2">Hozirgi Parol</label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              placeholder="Hozirgi parolingizni kiriting"
              class="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-textPrimary font-medium focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 placeholder-brand-textSecondary/50 pr-12 transition-all"
            />
            <button @click="showCurrent = !showCurrent" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-primary transition-colors">
              {{ showCurrent ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label class="text-xs font-black text-brand-textSecondary uppercase tracking-widest block mb-2">Yangi Parol</label>
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Kamida 6 ta belgi"
              class="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-textPrimary font-medium focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 placeholder-brand-textSecondary/50 pr-12 transition-all"
            />
            <button @click="showNew = !showNew" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-primary transition-colors">
              {{ showNew ? '🙈' : '👁️' }}
            </button>
          </div>
          <!-- Strength Bar -->
          <div class="mt-3 h-1.5 rounded-full bg-brand-background overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="strengthColor"
              :style="`width: ${strengthPercent}%`"
            ></div>
          </div>
          <p class="text-[10px] mt-1.5 font-bold uppercase tracking-wider" :class="strengthTextColor">{{ strengthLabel }}</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="text-xs font-black text-brand-textSecondary uppercase tracking-widest block mb-2">Parolni Tasdiqlang</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Parolni qayta kiriting"
            class="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-textPrimary font-medium focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 placeholder-brand-textSecondary/50 transition-all"
            :class="form.confirmPassword && form.newPassword !== form.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''"
          />
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-xs font-bold text-red-600 mt-2 flex items-center gap-1">
            <span>⚠️</span> Parollar mos kelmaydi
          </p>
        </div>

        <!-- Error/Success Messages -->
        <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
          <span>⚠️</span> {{ error }}
        </div>
        <div v-if="success" class="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold flex items-center gap-2">
          <span>✅</span> {{ success }}
        </div>

        <!-- Submit Button -->
        <button
          @click="submitChange"
          :disabled="loading || !isFormValid"
          class="w-full py-3.5 rounded-xl font-black text-sm transition-all uppercase tracking-widest"
          :class="isFormValid
            ? 'bg-brand-primary hover:bg-[#1A4B65] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
            : 'bg-brand-background text-brand-textSecondary cursor-not-allowed border border-brand-border'"
        >
          {{ loading ? 'Saqlanmoqda...' : 'Parolni O\'zgartirish' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Parolni O'zgartirish — ORZU EDU" })

const authStore = useAuthStore()


const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showCurrent = ref(false)
const showNew = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

// Password strength
const strengthPercent = computed(() => {
  const p = form.value.newPassword
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score += 25
  if (p.length >= 10) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9!@#$%^&*]/.test(p)) score += 25
  return score
})

const strengthLabel = computed(() => {
  const s = strengthPercent.value
  if (!s) return ''
  if (s <= 25) return 'Zaif parol'
  if (s <= 50) return 'O\'rta parol'
  if (s <= 75) return 'Yaxshi parol'
  return '💪 Kuchli parol'
})

const strengthColor = computed(() => {
  const s = strengthPercent.value
  if (s <= 25) return 'bg-rose-500'
  if (s <= 50) return 'bg-amber-500'
  if (s <= 75) return 'bg-blue-500'
  return 'bg-emerald-500'
})

const strengthTextColor = computed(() => {
  const s = strengthPercent.value
  if (s <= 25) return 'text-rose-400'
  if (s <= 50) return 'text-amber-400'
  if (s <= 75) return 'text-blue-400'
  return 'text-emerald-400'
})

const isFormValid = computed(() =>
  form.value.currentPassword.length >= 1 &&
  form.value.newPassword.length >= 6 &&
  form.value.newPassword === form.value.confirmPassword
)

const submitChange = async () => {
  if (!isFormValid.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    if (import.meta.client) authStore.initializeStore()
    const token = authStore.token
    if (!token) { navigateTo('/login'); return }
    await $fetch('/api/v1/auth/update-password', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword
      }
    })
    success.value = 'Parol muvaffaqiyatli o\'zgartirildi!'
    form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e: any) {
    error.value = e?.data?.message || 'Xatolik yuz berdi'
  } finally {
    loading.value = false
  }
}
</script>
