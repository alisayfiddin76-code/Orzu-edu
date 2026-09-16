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
            Fayllar va Darsliklar
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">📚</span> Darslik Materiallari
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">O'qituvchi yuklagan dars fayllari — PDF, Word, Rasmlar va qo'llanmalar</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-brand-textSecondary mt-4">Materiallar yuklanmoqda...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-red-600 text-sm font-bold">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="materials.length === 0" class="text-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm px-6">
        <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">📁</div>
        <p class="text-lg font-black text-brand-primary">Materiallar yo'q</p>
        <p class="text-sm text-brand-textSecondary mt-2 font-medium">O'qituvchi hali material yuklamagan.</p>
      </div>

      <!-- Materials List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="plan in materials" :key="plan._id"
          class="group relative overflow-hidden rounded-3xl bg-white border border-brand-border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-accent/50 flex flex-col h-full shadow-sm">
          
          <div class="absolute inset-0 bg-brand-background opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          <div class="relative z-10 flex-1">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-block text-[10px] font-black text-brand-primary uppercase tracking-wider bg-brand-primary/5 px-3 py-1 rounded-lg border border-brand-primary/10">
                {{ plan.group?.title }}
              </span>
              <span class="text-[10px] text-brand-textSecondary font-bold flex items-center gap-1">
                <span>📅</span> {{ formatDate(plan.date) }}
              </span>
            </div>
            
            <h3 class="font-black text-brand-primary text-lg group-hover:text-[#1A4B65] transition-colors leading-tight mb-4">{{ plan.topic }}</h3>
          </div>

          <div class="relative z-10 mt-auto pt-4 border-t border-brand-border">
            <p class="text-[10px] text-brand-textSecondary uppercase tracking-widest font-black mb-3">Ilova qilingan fayllar:</p>
            <div class="flex flex-col gap-2">
              <a
                v-for="(mat, i) in plan.materials"
                :key="i"
                :href="`${mat}`"
                target="_blank"
                class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-brand-background border border-brand-border group/file hover:border-brand-primary/30 hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <span class="text-xl group-hover/file:scale-110 transition-transform">{{ fileIcon(mat) }}</span>
                  <span class="text-sm font-bold text-brand-textPrimary group-hover/file:text-brand-primary truncate transition-colors">{{ fileName(mat) }}</span>
                </div>
                <span class="text-brand-textSecondary group-hover/file:text-brand-primary group-hover/file:translate-x-1 transition-all">↓</span>
              </a>
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
useHead({ title: 'Materiallar — ORZU EDU' })

const authStore = useAuthStore()

const { data, pending, error } = await useFetch<any>('/api/v1/students/my-materials', {
  headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` }))
})

const materials = computed(() => data.value?.data?.materials ?? [])

const formatDate = (d: any) => new Date(d).toLocaleDateString('uz-UZ', { dateStyle: 'medium' })

const fileIcon = (path: string) => {
  if (path.match(/\.(pdf)$/i)) return '📄'
  if (path.match(/\.(doc|docx)$/i)) return '📝'
  if (path.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return '🖼️'
  return '📎'
}

const fileName = (path: string) => {
  const parts = path.split('/')
  const name = parts[parts.length - 1]
  // Remove timestamp prefix (e.g. 1720123456789-123456789-)
  return name.replace(/^\d+-\d+-/, '').slice(0, 25) + (name.length > 25 ? '...' : '')
}
</script>
