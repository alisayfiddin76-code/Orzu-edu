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
            Uy vazifalari va muddatlar
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span class="text-brand-accent">📝</span> Mening Vazifalarim
          </h1>
          <p class="text-[#94B0C7] text-sm mt-3 font-medium">O'qituvchi yuborgan uy vazifalari, qo'shimcha topshiriqlar va muddatlari</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-brand-textSecondary mt-4">Vazifalar yuklanmoqda...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-red-600 text-sm font-bold">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="homework.length === 0" class="text-center py-16 bg-white rounded-3xl border border-brand-border shadow-sm px-6">
        <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">📂</div>
        <p class="text-lg font-black text-brand-primary">Uy vazifalari yo'q</p>
        <p class="text-sm text-brand-textSecondary mt-2 font-medium">O'qituvchi hali vazifa bermagan.</p>
      </div>

      <!-- Homework List -->
      <div v-else class="space-y-4">
        <div v-for="hw in homework" :key="hw._id"
          class="group relative overflow-hidden rounded-3xl bg-white border p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
          :class="isOverdue(hw.homeworkDeadline) ? 'border-red-200 hover:border-red-300' : 'border-brand-border hover:border-brand-accent/50'">
          
          <div class="absolute inset-0 bg-brand-background opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          <div class="relative flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="inline-block text-[10px] font-black text-brand-primary uppercase tracking-wider bg-brand-primary/5 px-3 py-1 rounded-lg border border-brand-primary/10">
                  {{ hw.group?.title }}
                </span>
                <span v-if="isOverdue(hw.homeworkDeadline)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-red-50 border border-red-200 text-red-600 uppercase tracking-wider">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Muddat o'tdi
                </span>
                <span v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-50 border border-green-200 text-green-700 uppercase tracking-wider">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Aktiv
                </span>
              </div>
              <h3 class="font-black text-brand-primary text-xl group-hover:text-[#1A4B65] transition-colors">{{ hw.topic }}</h3>
              <div class="text-sm text-brand-textPrimary mt-3 leading-relaxed bg-brand-background rounded-xl p-4 border border-brand-border shadow-inner font-medium">
                {{ hw.homeworkDetails }}
              </div>
              
              <!-- Teacher Materials -->
              <div v-if="hw.materials && hw.materials.length > 0" class="mt-4 p-4 rounded-xl border border-brand-border bg-white shadow-sm">
                <p class="text-[10px] font-black text-brand-textSecondary uppercase tracking-wider mb-2">O'qituvchi biriktirgan materiallar:</p>
                <div class="flex flex-wrap gap-2">
                  <a v-for="(mat, idx) in hw.materials" :key="idx" :href="mat" target="_blank"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/5 text-brand-primary text-xs font-bold hover:bg-brand-primary/10 transition-colors border border-brand-primary/10">
                    <span>📄</span> Material {{ idx + 1 }}
                  </a>
                </div>
              </div>

              <!-- Student Submission Form or Status -->
              <div class="mt-6 pt-6 border-t border-brand-border border-dashed">
                <div v-if="hw.submission" class="bg-brand-background p-4 rounded-xl border border-brand-border mb-4">
                  <div class="flex justify-between items-center mb-3">
                    <p class="text-xs font-black text-brand-primary uppercase tracking-wider">Mening javobim</p>
                    <span v-if="hw.submission.status === 'GRADED'" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-50 border border-green-200 text-green-700 uppercase tracking-wider">
                      Baho: {{ hw.submission.grade }} / 5
                    </span>
                    <span v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-yellow-50 border border-yellow-200 text-yellow-700 uppercase tracking-wider">
                      Tekshirilmoqda
                    </span>
                  </div>
                  
                  <div v-if="hw.submission.studentNote" class="text-sm text-brand-textPrimary mb-3 italic">
                    "{{ hw.submission.studentNote }}"
                  </div>
                  
                  <div v-if="hw.submission.submittedFiles?.length > 0" class="flex flex-wrap gap-2 mb-3">
                    <a v-for="(file, idx) in hw.submission.submittedFiles" :key="idx" :href="file" target="_blank"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-brand-border text-brand-primary text-xs font-bold hover:border-brand-accent transition-colors">
                      <span>📁</span> Fayl {{ idx + 1 }}
                    </a>
                  </div>
                  
                  <div v-if="hw.submission.feedback" class="mt-3 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                    <p class="text-[10px] font-black text-brand-primary uppercase tracking-wider mb-1">O'qituvchi izohi:</p>
                    <p class="text-sm text-brand-textPrimary font-medium">{{ hw.submission.feedback }}</p>
                  </div>
                </div>

                <p v-if="!hw.submission || hw.submission.status === 'PENDING'" class="text-xs font-black text-brand-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🚀</span> {{ hw.submission ? 'Qayta yuborish' : 'Javobni yuborish' }}
                </p>
                <form v-if="!hw.submission || hw.submission.status === 'PENDING'" @submit.prevent="submitHomework(hw._id)" class="space-y-3">
                  <textarea v-model="submissionData[hw._id].note" rows="2" placeholder="O'qituvchi uchun izoh (ixtiyoriy)..."
                    class="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-y"></textarea>
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-brand-border hover:border-brand-accent text-brand-textSecondary hover:text-brand-primary transition-all text-sm font-bold group w-fit">
                      <span class="text-lg group-hover:scale-110 transition-transform">📎</span> 
                      <span>{{ submissionData[hw._id].files?.length ? submissionData[hw._id].files.length + ' ta fayl tanlandi' : 'Fayl biriktirish (PDF, PNG...)' }}</span>
                      <input type="file" multiple class="hidden" @change="e => handleFileSelect(e, hw._id)" />
                    </label>

                    <button type="submit" :disabled="submittingId === hw._id || (!submissionData[hw._id].note && !submissionData[hw._id].files?.length)"
                      class="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-[#1A4B65] text-white font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span v-if="submittingId === hw._id">Yuborilmoqda...</span>
                      <template v-else>
                        <span>Yuborish</span>
                        <span>➡️</span>
                      </template>
                    </button>
                  </div>
                  <p v-if="submitMessage[hw._id]" class="text-xs font-bold text-green-600 mt-2">{{ submitMessage[hw._id] }}</p>
                  <p v-if="submitError[hw._id]" class="text-xs font-bold text-red-500 mt-2">{{ submitError[hw._id] }}</p>
                </form>
              </div>
            </div>

            <div class="shrink-0 sm:text-right bg-white p-4 rounded-2xl border border-brand-border shadow-sm h-fit sm:min-w-[160px] relative z-10">
              <p class="text-[10px] font-black uppercase tracking-widest text-brand-textSecondary mb-1">Topshirish muddati:</p>
              <p class="font-black text-sm flex items-center sm:justify-end gap-1.5" :class="isOverdue(hw.homeworkDeadline) ? 'text-red-600' : 'text-brand-accent'">
                <span>⏰</span> {{ formatDateTime(hw.homeworkDeadline) }}
              </p>
              <div class="h-px bg-brand-border my-3"></div>
              <p class="text-[10px] font-bold text-brand-textSecondary flex items-center sm:justify-end gap-1">
                <span>📅</span> Berilgan: {{ formatDate(hw.date) }}
              </p>
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
useHead({ title: 'Vazifalarim — ORZU EDU' })

const authStore = useAuthStore()

const { data, pending, error } = await useFetch<any>('/api/v1/students/my-homework', {
  headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` }))
})

const homework = computed(() => data.value?.data?.homework ?? [])
const isOverdue = (deadline: any) => deadline && new Date(deadline) < new Date()
const formatDate = (d: any) => new Date(d).toLocaleDateString('uz-UZ', { dateStyle: 'medium' })
const formatDateTime = (d: any) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' })
}

// Submission state
import { ref, watch } from 'vue'

const submissionData = ref<Record<string, { note: string; files: File[] }>>({})
const submittingId = ref<string | null>(null)
const submitMessage = ref<Record<string, string>>({})
const submitError = ref<Record<string, string>>({})

// Initialize submission data
watch(homework, (hws) => {
  if (hws && hws.length) {
    hws.forEach((hw: any) => {
      if (!submissionData.value[hw._id]) {
        submissionData.value[hw._id] = { note: '', files: [] }
      }
    })
  }
}, { immediate: true })

const handleFileSelect = (e: Event, hwId: string) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    submissionData.value[hwId].files = Array.from(target.files)
  }
}

const submitHomework = async (hwId: string) => {
  submittingId.value = hwId
  submitMessage.value[hwId] = ''
  submitError.value[hwId] = ''

  try {
    const formData = new FormData()
    formData.append('studentNote', submissionData.value[hwId].note)
    submissionData.value[hwId].files.forEach(f => {
      formData.append('files', f)
    })

    await $fetch(`/api/v1/students/homework/${hwId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: formData
    })

    submitMessage.value[hwId] = 'Vazifa muvaffaqiyatli yuborildi!'
    // Clear form
    submissionData.value[hwId] = { note: '', files: [] }
  } catch (err: any) {
    submitError.value[hwId] = err.data?.message || 'Vazifani yuborishda xatolik yuz berdi'
  } finally {
    submittingId.value = null
  }
}
</script>
