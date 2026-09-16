<template>
  <div class="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Back Link -->
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="group flex items-center gap-2 text-brand-textSecondary hover:text-brand-primary text-sm font-bold transition-all duration-300">
          <span class="group-hover:-translate-x-1 transition-transform duration-300">←</span> Kabinetga qaytish
        </NuxtLink>
      </div>

      <!-- Header: Premium Brand Design -->
      <div class="relative overflow-hidden rounded-3xl bg-brand-primary border-b-4 border-brand-accent p-6 sm:p-8 shadow-xl shadow-brand-primary/10">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-accent/10 blur-2xl"></div>
        
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent border border-brand-accent/30 mb-4">
            O'zlashtirish Ko'rsatkichi
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">⭐</span> Mening Baholarim
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">O'qituvchi qo'ygan baholar — dars va fan bo'yicha</p>
        </div>
      </div>

      <!-- Avg Stats Card -->
      <div v-if="!pending && grades.length > 0" class="group relative overflow-hidden rounded-2xl bg-white border border-brand-border p-5 sm:p-6 transition-all duration-300 hover:border-brand-accent hover:shadow-lg shadow-sm flex items-center gap-6 sm:gap-8">
        <div class="absolute inset-0 bg-brand-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div class="relative text-center px-4 sm:px-8 border-r border-brand-border">
          <p class="text-4xl sm:text-5xl font-black" :class="Number(avgGrade) >= 4 ? 'text-green-600' : (Number(avgGrade) >= 3 ? 'text-orange-500' : 'text-red-600')">
            {{ avgGrade }}
          </p>
          <p class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-textSecondary mt-2">Umumiy o'rtacha</p>
        </div>
        
        <div class="relative">
          <p class="text-sm sm:text-base text-brand-textPrimary font-bold">Jami <span class="text-brand-primary font-black text-lg mx-1">{{ grades.length }}</span> ta baho olingan</p>
          <p class="text-xs text-brand-textSecondary mt-1 flex items-center gap-1.5 font-medium">
            <span class="text-brand-primary">📅</span>
            {{ grades.length > 0 ? formatDate(grades[grades.length-1].date) : '' }} dan beri
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-brand-textSecondary mt-4">Baholar yuklanmoqda...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-red-600 text-sm font-bold">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="grades.length === 0" class="text-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm px-6">
        <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">📝</div>
        <p class="text-lg font-black text-brand-primary">Baholar yo'q</p>
        <p class="text-sm text-brand-textSecondary mt-2 font-medium">O'qituvchi hali baho qo'ymagan.</p>
      </div>

      <!-- Table / List -->
      <div v-else class="rounded-3xl border border-brand-border overflow-hidden bg-white shadow-lg shadow-brand-primary/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm whitespace-nowrap">
            <thead>
              <tr class="bg-brand-background text-brand-textSecondary text-xs uppercase tracking-widest font-black border-b border-brand-border">
                <th class="text-left px-6 py-4">Sana</th>
                <th class="text-left px-6 py-4">Guruh</th>
                <th class="text-left px-6 py-4">Mavzu</th>
                <th class="text-left px-6 py-4">Baho</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-border">
              <tr v-for="g in grades" :key="g._id" class="hover:bg-brand-background/50 transition-colors duration-200">
                <td class="px-6 py-4 text-brand-textSecondary font-bold">{{ formatDate(g.date) }}</td>
                <td class="px-6 py-4 text-brand-primary font-black">
                  <span class="inline-block px-3 py-1 rounded-md bg-brand-primary/5 border border-brand-primary/10 text-xs text-brand-primary">
                    {{ g.group?.title || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-brand-textPrimary font-medium">{{ g.topic }}</td>
                <td class="px-6 py-4">
                  <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-background border border-brand-border shadow-sm">
                    <span class="text-lg font-black" :class="g.value >= 4 ? 'text-green-600' : g.value >= 3 ? 'text-orange-500' : 'text-red-600'">
                      {{ g.value }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Baholarim — ORZU EDU' })

const authStore = useAuthStore()

const { data, pending, error } = await useFetch<any>('/api/v1/students/my-grades', {
  headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` }))
})

const grades = computed(() => data.value?.data?.grades ?? [])
const avgGrade = computed(() => {
  if (grades.value.length === 0) return 0
  const sum = grades.value.reduce((s: number, g: any) => s + g.value, 0)
  return (sum / grades.value.length).toFixed(1)
})
const formatDate = (d: any) => new Date(d).toLocaleDateString('uz-UZ', { dateStyle: 'medium' })
</script>
