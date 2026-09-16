<template>
  <div class="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Back Link -->
      <div class="flex items-center justify-between gap-4">
        <NuxtLink to="/dashboard" class="group flex items-center gap-2 text-brand-textSecondary hover:text-brand-primary text-sm font-bold transition-all duration-300">
          <span class="group-hover:-translate-x-1 transition-transform duration-300">←</span> Kabinetga qaytish
        </NuxtLink>
        
        <!-- Group Filter Dropdown -->
        <div v-if="uniqueGroups.length > 0" class="flex items-center gap-2">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wide">Guruhni tanlang:</label>
          <select 
            v-model="selectedGroupId"
            class="bg-white border border-brand-border rounded-xl px-3 py-1.5 text-sm font-bold text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 cursor-pointer shadow-sm"
          >
            <option value="ALL">Barcha guruhlar</option>
            <option v-for="grp in uniqueGroups" :key="grp._id" :value="grp._id">
              {{ grp.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- Header: Premium Brand Design -->
      <div class="relative overflow-hidden rounded-3xl bg-brand-primary border-b-4 border-brand-accent p-6 sm:p-8 shadow-xl shadow-brand-primary/10">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-accent/10 blur-2xl"></div>
        
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent border border-brand-accent/30 mb-4">
            Davomat Statistikasi
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">📋</span> Mening Davomatim
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">
            O'qituvchi belgilagan keldi / kelmadi / kechikdi holatlari
            <span v-if="selectedGroupId !== 'ALL'" class="text-white ml-1 font-bold">({{ filteredAttendance.length }} ta dars)</span>
          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div v-if="!pending && filteredAttendance.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div class="group relative overflow-hidden rounded-2xl bg-white border border-brand-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg shadow-sm text-center">
          <div class="w-12 h-12 mx-auto bg-green-50 rounded-full flex items-center justify-center text-xl mb-3">✅</div>
          <p class="text-3xl font-black text-brand-primary">{{ presentCount }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-brand-textSecondary mt-1">Keldi</p>
        </div>
        
        <div class="group relative overflow-hidden rounded-2xl bg-white border border-brand-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-lg shadow-sm text-center">
          <div class="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center text-xl mb-3">❌</div>
          <p class="text-3xl font-black text-brand-primary">{{ absentCount }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-brand-textSecondary mt-1">Kelmadi</p>
        </div>
        
        <div class="group relative overflow-hidden rounded-2xl bg-white border border-brand-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg shadow-sm text-center">
          <div class="w-12 h-12 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-xl mb-3">⏰</div>
          <p class="text-3xl font-black text-brand-primary">{{ lateCount }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-brand-textSecondary mt-1">Kechikdi</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-brand-textSecondary mt-4">Davomat yuklanmoqda...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-red-600 text-sm font-bold">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAttendance.length === 0" class="text-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm px-6">
        <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
        <p class="text-lg font-black text-brand-primary">Davomat ma'lumotlari yo'q</p>
        <p class="text-sm text-brand-textSecondary mt-2 font-medium">Bu guruh uchun o'qituvchi hali davomat belgilamagan.</p>
      </div>

      <!-- Table / List -->
      <div v-else class="rounded-3xl border border-brand-border overflow-hidden bg-white shadow-lg shadow-brand-primary/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm whitespace-nowrap">
            <thead>
              <tr class="bg-brand-background text-brand-textSecondary text-xs uppercase tracking-widest font-black border-b border-brand-border">
                <th class="text-left px-6 py-4">Sana</th>
                <th class="text-left px-6 py-4">Guruh</th>
                <th class="text-left px-6 py-4">Holat</th>
                <th class="text-left px-6 py-4">Izoh</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-border">
              <tr v-for="rec in filteredAttendance" :key="rec._id" class="hover:bg-brand-background/50 transition-colors duration-200">
                <td class="px-6 py-4 text-brand-textSecondary font-bold">{{ formatDate(rec.date) }}</td>
                <td class="px-6 py-4 text-brand-primary font-black">{{ rec.group?.title || '—' }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                    :class="{
                      'text-green-700 bg-green-50 border-green-200': rec.status === 'PRESENT',
                      'text-red-700 bg-red-50 border-red-200': rec.status === 'ABSENT',
                      'text-orange-700 bg-orange-50 border-orange-200': rec.status === 'LATE',
                    }"
                  >
                    {{ statusLabel(rec.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-brand-textSecondary text-xs italic font-medium">{{ rec.reason || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Davomatim — ORZU EDU' })

const authStore = useAuthStore()

const { data, pending, error } = await useFetch<any>('/api/v1/students/my-attendance', {
  headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` }))
})

const attendance = computed(() => data.value?.data?.attendance ?? [])

// Extract unique groups from attendance records for the filter dropdown
const uniqueGroups = computed(() => {
  const groupsMap = new Map()
  attendance.value.forEach((rec: any) => {
    if (rec.group && rec.group._id) {
      if (!groupsMap.has(rec.group._id)) {
        groupsMap.set(rec.group._id, rec.group)
      }
    }
  })
  return Array.from(groupsMap.values())
})

const selectedGroupId = ref<string>('ALL')

// Filter records based on selected group
const filteredAttendance = computed(() => {
  if (selectedGroupId.value === 'ALL') return attendance.value
  return attendance.value.filter((rec: any) => rec.group && rec.group._id === selectedGroupId.value)
})

const presentCount = computed(() => filteredAttendance.value.filter((r: any) => r.status === 'PRESENT').length)
const absentCount = computed(() => filteredAttendance.value.filter((r: any) => r.status === 'ABSENT').length)
const lateCount = computed(() => filteredAttendance.value.filter((r: any) => r.status === 'LATE').length)

const formatDate = (d: any) => new Date(d).toLocaleDateString('uz-UZ', { dateStyle: 'medium' })
const statusLabel = (s: string) => ({ PRESENT: '✅ Keldi', ABSENT: '❌ Kelmadi', LATE: '⏰ Kechikdi' }[s] || s)
</script>
