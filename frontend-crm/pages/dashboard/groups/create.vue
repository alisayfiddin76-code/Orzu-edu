<template>
  <div class="space-y-8">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">➕ Yangi Guruh Yaratish</h1>
        <p class="text-sm text-slate-400 mt-1">Yangi o'quv guruhini bosqichma-bosqich to'ldiring</p>
      </div>
      <NuxtLink to="/dashboard/groups" class="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
        ← Guruhlarga qaytish
      </NuxtLink>
    </div>

    <!-- Alert messages -->
    <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      ⚠️ {{ error }}
    </div>
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
      ✅ {{ successMessage }}
    </div>

    <!-- Step indicators -->
    <div class="flex items-center gap-0">
      <div v-for="(step, idx) in steps" :key="idx" class="flex items-center">
        <div class="flex flex-col items-center">
          <div :class="[
            'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
            currentStep > idx
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : currentStep === idx
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-slate-700 text-slate-600 bg-slate-950'
          ]">
            {{ currentStep > idx ? "✓" : idx + 1 }}
          </div>
          <span class="text-[10px] mt-1 font-semibold" :class="currentStep === idx ? 'text-indigo-400' : 'text-slate-600'">
            {{ step }}
          </span>
        </div>
        <div v-if="idx < steps.length - 1" :class="['flex-1 h-px w-16 mx-2 mb-4', currentStep > idx ? 'bg-indigo-600' : 'bg-slate-800']"></div>
      </div>
    </div>

    <!-- ═══ STEP 0: Asosiy ma'lumotlar ═══════════════════════════════ -->
    <div v-if="currentStep === 0" class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-5">
      <h2 class="text-lg font-bold text-white">📝 Guruh asosiy ma'lumotlari</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Guruh nomi -->
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Guruh nomi *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Masalan: Frontend Vue.js — Guruh #1"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <!-- Kurs tanlash -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kurs (Fan) *</label>
          <select
            v-model="form.course"
            @change="onCourseChange"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          >
            <option value="" disabled>Kursni tanlang...</option>
            <option v-for="c in courses" :key="c._id" :value="c._id">{{ c.title }}</option>
          </select>
        </div>

        <!-- O'qituvchi tanlash -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">O'qituvchi *</label>
          <select
            v-model="form.teacher"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          >
            <option value="" disabled>O'qituvchini tanlang...</option>
            <option v-for="t in teachers" :key="t._id" :value="t._id">{{ t.firstname }} {{ t.lastname }} ({{ t.phone }})</option>
          </select>
        </div>

        <!-- Dars kunlari -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dars kunlari *</label>
          <select
            v-model="form.days"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          >
            <option value="" disabled>Kunlarni tanlang...</option>
            <option value="ODD">Duy, Chor, Jum</option>
            <option value="EVEN">Se, Pay, Shan</option>
            <option value="EVERYDAY">Har kuni</option>
            <option value="CUSTOM">Maxsus jadval</option>
          </select>
        </div>

        <!-- Xona -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Xona raqami</label>
          <input
            v-model="form.room"
            type="text"
            placeholder="Masalan: 101-xona"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <!-- Narx -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Oylik to'lov narxi (so'm) *</label>
          <input
            v-model.number="form.price"
            type="number"
            placeholder="Masalan: 300000"
            min="0"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <!-- O'qituvchi ulushi -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            O'qituvchi ulushi % <span class="text-slate-600 font-normal normal-case">(default: 50%)</span>
          </label>
          <input
            v-model.number="form.teacher_share_percent"
            type="number"
            placeholder="50"
            min="0"
            max="100"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <!-- Boshlanish vaqti -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dars boshlanishi *</label>
          <input
            v-model="form.start_time"
            type="time"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <!-- Tugash vaqti -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dars tugashi *</label>
          <input
            v-model="form.end_time"
            type="time"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          @click="goToStep1"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all"
        >
          Keyingi: O'quvchilarni tanlash →
        </button>
      </div>
    </div>

    <!-- ═══ STEP 1: O'quvchilarni tanlash ═════════════════════════════ -->
    <div v-if="currentStep === 1" class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <h2 class="text-lg font-bold text-white">🎓 O'quvchilarni tanlash</h2>
        <span class="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          {{ selectedStudents.length }} ta tanlangan
        </span>
      </div>

      <!-- Loading -->
      <div v-if="studentsLoading" class="py-10 text-center">
        <div class="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-slate-400 text-sm">O'quvchilar yuklanmoqda...</p>
      </div>

      <template v-else>
        <!-- Search -->
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">🔍</span>
          <input
            v-model="studentSearch"
            type="text"
            placeholder="Ism yoki telefon orqali qidirish..."
            class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            v-if="studentSearch"
            @click="studentSearch = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs transition-colors"
          >✕</button>
        </div>

        <!-- Stats + Select All -->
        <div class="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Jami: <span class="text-slate-300 font-semibold">{{ allStudents.length }}</span> ta |
            Ko'rsatilmoqda: <span class="text-white font-semibold">{{ filteredStudents.length }}</span> ta
          </span>
          <button
            v-if="filteredStudents.length > 0"
            @click="toggleSelectAll"
            class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            {{ selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
              ? 'Tanlovni bekor qilish'
              : 'Barchasini tanlash' }}
          </button>
        </div>

        <!-- Students list -->
        <div v-if="filteredStudents.length > 0" class="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scroll">
          <label
            v-for="student in filteredStudents"
            :key="student._id"
            :for="`s-${student._id}`"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none"
            :class="selectedStudents.includes(student._id)
              ? 'bg-indigo-500/10 border-indigo-500/30'
              : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-600 hover:bg-slate-900/60'"
          >
            <input
              :id="`s-${student._id}`"
              type="checkbox"
              :value="student._id"
              v-model="selectedStudents"
              class="w-4 h-4 accent-indigo-500 cursor-pointer flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-white">
                {{ student.user?.firstname }} {{ student.user?.lastname }}
              </div>
              <div class="text-xs text-slate-500 font-mono mt-0.5">📱 {{ student.user?.phone || '—' }}</div>
            </div>
            <div v-if="student.enrollments?.length > 0"
              class="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {{ student.enrollments.length }} guruh
            </div>
            <svg v-if="selectedStudents.includes(student._id)"
              class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </label>
        </div>

        <!-- Empty state -->
        <div v-else class="py-10 text-center bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
          <span class="text-3xl block mb-2">🔍</span>
          <p class="text-slate-400 text-sm font-medium">
            {{ studentSearch ? `"${studentSearch}" bo'yicha hech narsa topilmadi` : "O'quvchilar topilmadi" }}
          </p>
          <p v-if="studentSearch" class="text-slate-600 text-xs mt-1">Boshqa kalit so'z kiriting</p>
        </div>
      </template>

      <div class="flex justify-between pt-2">
        <button @click="currentStep = 0" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-sm font-semibold transition-colors">
          ← Orqaga
        </button>
        <button
          @click="currentStep = 2"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all"
        >
          Keyingi: Tasdiqlash →
        </button>
      </div>
    </div>

    <!-- ═══ STEP 2: Tasdiqlash va yaratish ════════════════════════════ -->
    <div v-if="currentStep === 2" class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-6">
      <h2 class="text-lg font-bold text-white">✅ Guruh ma'lumotlarini tasdiqlang</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Guruh info -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guruh ma'lumotlari</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Nomi:</span>
              <span class="text-white font-medium">{{ form.title }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Kurs:</span>
              <span class="text-indigo-400 font-medium">{{ selectedCourseName }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">O'qituvchi:</span>
              <span class="text-white font-medium">{{ selectedTeacherName }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Kunlar:</span>
              <span class="text-white font-medium">{{ daysLabel }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Vaqt:</span>
              <span class="text-white font-medium">{{ form.start_time }} – {{ form.end_time }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Xona:</span>
              <span class="text-white font-medium">{{ form.room || 'Belgilanmagan' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Narx:</span>
              <span class="text-amber-400 font-bold">{{ new Intl.NumberFormat('uz-UZ').format(form.price) }} so'm</span>
            </div>
          </div>
        </div>

        <!-- Tanlangan o'quvchilar -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Tanlangan O'quvchilar ({{ selectedStudents.length }} ta)
          </h3>
          <div v-if="selectedStudents.length === 0" class="text-slate-600 text-sm italic py-6 text-center">
            <span class="block text-2xl mb-1">👤</span>
            Hech qanday o'quvchi tanlanmagan
          </div>
          <div v-else class="space-y-1 max-h-44 overflow-y-auto custom-scroll">
            <div
              v-for="id in selectedStudents"
              :key="id"
              class="flex items-center gap-2 text-sm text-slate-300 py-0.5"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
              {{ getStudentName(id) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between pt-2">
        <button @click="currentStep = 1" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-sm font-semibold transition-colors">
          ← Orqaga
        </button>
        <button
          @click="submitGroup"
          :disabled="submitting"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 px-8 rounded-xl transition-all"
        >
          <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ submitting ? "Saqlanmoqda..." : "✓ Guruhni Yaratish" }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })

const router = useRouter()

// ---- Steps ----
const steps = ["Asosiy ma'lumot", "O'quvchilar", "Tasdiqlash"]
const currentStep = ref(0)

// ---- State ----
const error = ref("")
const successMessage = ref("")
const submitting = ref(false)
const studentsLoading = ref(false)
const studentSearch = ref("")

// ---- API data ----
const courses = ref<any[]>([])
const teachers = ref<any[]>([])
const allStudents = ref<any[]>([])
const selectedStudents = ref<string[]>([])

// ---- Form ----
const form = reactive({
  title: "",
  course: "",
  teacher: "",
  days: "",
  room: "",
  price: 0,
  teacher_share_percent: 50,
  start_time: "",
  end_time: ""
})

// ---- Computed ----
const filteredStudents = computed(() => {
  const q = studentSearch.value.toLowerCase().trim()
  if (!q) return allStudents.value
  return allStudents.value.filter(s => {
    const name = `${s.user?.firstname || ""} ${s.user?.lastname || ""}`.toLowerCase()
    const phone = (s.user?.phone || "").toLowerCase()
    return name.includes(q) || phone.includes(q)
  })
})

const selectedCourseName = computed(() => {
  const c = courses.value.find(c => c._id === form.course)
  return c ? c.title : ""
})

const selectedTeacherName = computed(() => {
  const t = teachers.value.find(t => t._id === form.teacher)
  return t ? `${t.firstname} ${t.lastname}` : ""
})

const daysLabel = computed(() => {
  const map: Record<string, string> = {
    ODD: "Duy, Chor, Jum",
    EVEN: "Se, Pay, Shan",
    EVERYDAY: "Har kuni",
    CUSTOM: "Maxsus jadval"
  }
  return map[form.days] || form.days
})

// ---- Helpers ----
const getStudentName = (id: string) => {
  const s = allStudents.value.find(s => s._id === id)
  return s ? `${s.user?.firstname} ${s.user?.lastname} (${s.user?.phone})` : id
}

const toggleSelectAll = () => {
  const all = filteredStudents.value.map(s => s._id)
  const allSelected = all.every(id => selectedStudents.value.includes(id))
  if (allSelected) {
    selectedStudents.value = selectedStudents.value.filter(id => !all.includes(id))
  } else {
    const merged = new Set([...selectedStudents.value, ...all])
    selectedStudents.value = [...merged]
  }
}

const getToken = () => useCookie("auth_token").value

// ---- Fetch ----
const fetchCourses = async () => {
  try {
    const { data } = await $fetch<any>("/api/v1/courses?all=true", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    courses.value = data?.courses || []
  } catch {
    error.value = "Kurslarni yuklashda xatolik"
  }
}

const fetchTeachers = async () => {
  try {
    const { data } = await $fetch<any>("/api/v1/teachers", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    teachers.value = (data?.teachers || []).filter((t: any) => t.status === "ACTIVE")
  } catch {
    error.value = "O'qituvchilarni yuklashda xatolik"
  }
}

// Barcha o'quvchilarni yuklash — /api/v1/students/available emas
const fetchAllStudents = async () => {
  studentsLoading.value = true
  error.value = ""
  try {
    const { data } = await $fetch<any>("/api/v1/students", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    allStudents.value = (data?.students || []).filter((s: any) =>
      s.user?.firstname !== 'N/A' &&
      (!s.user?.status || s.user?.status === 'ACTIVE')
    )
  } catch (e: any) {
    error.value = e?.data?.message || "O'quvchilarni yuklashda xatolik"
  } finally {
    studentsLoading.value = false
  }
}

// ---- Step navigation ----
const goToStep1 = () => {
  error.value = ""
  if (!form.title.trim()) return (error.value = "Guruh nomini kiriting")
  if (!form.course)       return (error.value = "Kursni tanlang")
  if (!form.teacher)      return (error.value = "O'qituvchini tanlang")
  if (!form.days)         return (error.value = "Dars kunlarini tanlang")
  if (!form.start_time)   return (error.value = "Dars boshlanish vaqtini kiriting")
  if (!form.end_time)     return (error.value = "Dars tugash vaqtini kiriting")
  currentStep.value = 1
}

const onCourseChange = () => {
  const selectedCourse = courses.value.find(c => c._id === form.course)
  if (selectedCourse?.price) {
    form.price = selectedCourse.price
  }
}

// ---- Submit ----
const submitGroup = async () => {
  submitting.value = true
  error.value = ""
  try {
    await $fetch("/api/v1/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: {
        title: form.title,
        course: form.course,
        teacher: form.teacher,
        days: form.days,
        room: form.room,
        price: form.price,
        teacher_share_percent: form.teacher_share_percent,
        start_time: form.start_time,
        end_time: form.end_time,
        students: selectedStudents.value
      }
    })
    successMessage.value = "Guruh muvaffaqiyatli yaratildi! Yo'naltirilmoqda..."
    setTimeout(() => router.push("/dashboard/groups"), 1500)
  } catch (err: any) {
    error.value = err?.data?.message || "Guruhni yaratishda xatolik yuz berdi"
    submitting.value = false
  }
}

// ---- Init ----
onMounted(async () => {
  await Promise.all([fetchCourses(), fetchTeachers(), fetchAllStudents()])
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
</style>
