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
            Imtihonlar va Natijalar
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">🏆</span> Mening Imtihonlarim
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">Yaqinlashayotgan va o'tgan imtihonlar ro'yxati</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-brand-textSecondary mt-4">Imtihonlar yuklanmoqda...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-red-600 text-sm font-bold">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="exams.length === 0" class="text-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm px-6">
        <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">📋</div>
        <p class="text-lg font-black text-brand-primary">Imtihonlar yo'q</p>
        <p class="text-sm text-brand-textSecondary mt-2 font-medium">O'qituvchi hali imtihon rejalashtirmagan.</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Upcoming Exams -->
        <div v-if="upcoming.length > 0" class="space-y-4">
          <h2 class="flex items-center gap-2 text-sm font-black text-brand-primary uppercase tracking-widest pl-2">
            <span class="text-brand-accent animate-pulse">🔜</span> Yaqinlashayotgan
          </h2>
          <div class="grid gap-4">
            <div v-for="exam in upcoming" :key="exam._id"
              class="group relative overflow-hidden rounded-2xl bg-white border border-brand-border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div class="absolute inset-0 bg-brand-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div class="relative z-10 flex-1">
                <span class="inline-block px-3 py-1 rounded-md text-[10px] font-black bg-brand-primary/5 border border-brand-primary/10 text-brand-primary mb-2 uppercase tracking-wider">
                  {{ exam.group?.title }}
                </span>
                <p class="font-black text-brand-primary text-lg sm:text-xl group-hover:text-[#1A4B65] transition-colors">{{ exam.name }}</p>
              </div>
              
              <div class="relative z-10 w-full sm:w-auto shrink-0 bg-brand-background p-4 rounded-xl border border-brand-border text-left sm:text-right flex items-center justify-between sm:block shadow-inner">
                <div>
                  <p class="font-black text-brand-accent text-sm sm:text-base flex items-center gap-1.5 sm:justify-end">
                    <span>📅</span> {{ formatDateTime(exam.date) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="inline-block sm:block text-[11px] sm:text-xs font-bold text-brand-textSecondary sm:mt-1 bg-white sm:bg-transparent border sm:border-0 border-brand-border px-2 sm:px-0 py-1 sm:py-0 rounded">
                    {{ daysUntil(exam.date) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Exams -->
        <div v-if="past.length > 0" class="space-y-4">
          <h2 class="flex items-center gap-2 text-sm font-black text-brand-primary uppercase tracking-widest pl-2 mt-8">
            <span class="text-green-600">✅</span> O'tgan imtihonlar
          </h2>
          
          <div class="rounded-3xl border border-brand-border overflow-hidden bg-white shadow-lg shadow-brand-primary/5">
            <div class="overflow-x-auto">
              <table class="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr class="bg-brand-background text-brand-textSecondary text-xs uppercase tracking-widest font-black border-b border-brand-border">
                    <th class="text-left px-6 py-4">Sana</th>
                    <th class="text-left px-6 py-4">Guruh</th>
                    <th class="text-left px-6 py-4">Imtihon nomi</th>
                    <th class="text-left px-6 py-4">Natija</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-brand-border">
                  <tr v-for="exam in past" :key="exam._id" class="hover:bg-brand-background/50 transition-colors duration-200 group">
                    <td class="px-6 py-4 text-brand-textSecondary font-bold">{{ formatDate(exam.date) }}</td>
                    <td class="px-6 py-4 text-brand-primary font-black">
                      <span class="inline-block px-3 py-1 rounded-md bg-brand-primary/5 border border-brand-primary/10 text-[11px] text-brand-primary">
                        {{ exam.group?.title || '—' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-brand-textPrimary font-medium">{{ exam.name }}</td>
                    <td class="px-6 py-4">
                      <div v-if="exam.myScore !== null" class="inline-flex items-center justify-center min-w-[3rem] px-2 h-8 rounded-lg bg-brand-background border border-brand-border shadow-sm group-hover:border-brand-primary/20 transition-colors">
                        <span class="text-base font-black"
                          :class="exam.myScore >= 4 ? 'text-green-600' : exam.myScore >= 3 ? 'text-orange-500' : 'text-red-600'">
                          {{ exam.myScore }}
                        </span>
                      </div>
                      <span v-else class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-background text-brand-textSecondary border border-brand-border">
                        Kiritilmagan
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Imtihonlarim — ORZU EDU' })

const authStore = useAuthStore()

const { data, pending, error } = await useFetch<any>('/api/v1/students/my-exams', {
  headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` }))
})

const exams = computed(() => data.value?.data?.exams ?? [])
const upcoming = computed(() => exams.value.filter((e: any) => new Date(e.date) >= new Date()))
const past = computed(() => exams.value.filter((e: any) => new Date(e.date) < new Date()).reverse())

const daysUntil = (date: any) => {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  if (diff === 0) return 'Bugun!'
  if (diff === 1) return 'Ertaga'
  return `${diff} kun qoldi`
}

const formatDate = (d: any) => new Date(d).toLocaleDateString('uz-UZ', { dateStyle: 'medium' })
const formatDateTime = (d: any) => new Date(d).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' })
</script>
