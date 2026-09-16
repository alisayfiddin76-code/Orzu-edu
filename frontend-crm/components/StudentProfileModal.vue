<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="closeModal"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
              {{ profile?.student?.user?.firstname?.[0] || '?' }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">
                {{ profile?.student?.user?.firstname }} {{ profile?.student?.user?.lastname }}
              </h2>
              <p class="text-xs text-slate-400">Tizimga qo'shilgan: {{ formatDate(profile?.student?.joined_date) }}</p>
            </div>
          </div>
          <button @click="closeModal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-8 flex-1">
          <div v-if="loading" class="py-12 flex justify-center">
            <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>

          <template v-else-if="profile">
            <!-- Contact Info -->
            <div>
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">📞 Aloqa ma'lumotlari</h3>
              <div class="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <p class="text-xs text-slate-500 mb-1">Telefon</p>
                <p class="text-sm font-bold text-white">{{ profile.student?.user?.phone || 'Kiritilmagan' }}</p>
              </div>
            </div>

            <!-- Enrollments (Groups) -->
            <div>
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">🎓 O'qiyotgan Guruhlari</h3>
              <div v-if="profile.groups?.length > 0" class="space-y-3">
                <div v-for="en in profile.groups" :key="en.group?._id" class="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Fan: {{ en.group?.course?.title || '—' }}</p>
                    <p class="text-sm font-bold text-white mb-1">Guruh: {{ en.group?.title }}</p>
                    <p class="text-xs text-slate-400">O'qituvchi: {{ en.group?.teacher?.firstname }} {{ en.group?.teacher?.lastname }}</p>
                    <p class="text-xs text-slate-400 mt-1" v-if="en.group?.start_time">Dars vaqti: {{ en.group?.start_time }} - {{ en.group?.end_time }}</p>
                  </div>
                  <div class="sm:text-right">
                    <p class="text-xs text-slate-500 mb-1">Qo'shilgan sana</p>
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                      {{ formatDate(en.joined_at) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-sm text-slate-500">
                Hali guruhlarga biriktirilmagan
              </div>
            </div>

            <!-- Grades (Only visible if grades returned from API) -->
            <div v-if="profile.grades?.length > 0">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">📝 O'z guruhlaringizdagi baholari</h3>
              <div class="space-y-2">
                <div v-for="g in profile.grades" :key="g._id" class="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p class="text-sm font-semibold text-white">{{ g.lesson?.title || 'Dars' }}</p>
                    <p class="text-[10px] text-slate-500">{{ formatDate(g.lesson?.date || g.createdAt) }} — {{ g.group?.title }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-amber-400">{{ g.score }}/100</span>
                    <span v-if="g.feedback" class="text-[10px] text-slate-400 truncate max-w-[100px]">{{ g.feedback }}</span>
                  </div>
                </div>
              </div>
            </div>

          </template>

          <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  studentId: string
}>()

const emit = defineEmits(['update:modelValue'])

const profile = ref<any>(null)
const loading = ref(false)
const error = ref('')

const closeModal = () => {
  emit('update:modelValue', false)
  profile.value = null
}

const fetchProfile = async () => {
  if (!props.studentId) return
  loading.value = true
  error.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(`/api/v1/students/${props.studentId}/profile`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    profile.value = res.data
  } catch (e: any) {
    error.value = e?.data?.message || 'Ma\'lumotlarni yuklashda xatolik'
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.studentId) {
    fetchProfile()
  }
})

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
