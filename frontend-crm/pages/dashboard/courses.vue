<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">📚 Kurslar Boshqaruvi</h1>
        <p class="text-sm text-slate-400 mt-1">Barcha kurslarni ko'rish, tahrirlash va o'chirish</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors border border-slate-700/60"
          @click="showCourseForm = !showCourseForm"
        >
          {{ showCourseForm ? "Bekor qilish" : "+ Yangi Kurs Qo'shish" }}
        </button>
        <NuxtLink
          to="/dashboard/groups/create"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          + Yangi Guruh Qo'shish
        </NuxtLink>
      </div>
    </div>

    <!-- =========  CREATE COURSE FORM ========= -->
    <Transition name="slide-down">
      <div
        v-if="showCourseForm"
        class="p-6 rounded-2xl bg-slate-950/50 border border-indigo-500/20 shadow-xl shadow-indigo-600/5"
      >
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">📚</div>
          <div>
            <h3 class="text-md font-bold text-white">Yangi Kurs Yaratish</h3>
            <p class="text-xs text-slate-500">Barcha maydonlar to'ldirilishi shart</p>
          </div>
        </div>

        <!-- Success Alert -->
        <div
          v-if="courseSuccess"
          class="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
        >
          ✅ Kurs muvaffaqiyatli yaratildi!
        </div>

        <!-- Error Alert -->
        <div
          v-if="courseError"
          class="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {{ courseError }}
        </div>

        <form @submit.prevent="createCourse" class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Course Name -->
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Kurs Nomi *
            </label>
            <input
              id="course-title"
              v-model="courseForm.title"
              type="text"
              placeholder="Masalan: Frontend Vue.js 3"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Kurs Davomiyligi *
            </label>
            <input
              id="course-duration"
              v-model="courseForm.duration"
              type="text"
              placeholder="Masalan: 3 oy"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <!-- Price -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Oylik Narxi (UZS) *
            </label>
            <input
              id="course-price"
              v-model.number="courseForm.price"
              type="number"
              placeholder="Masalan: 750000"
              min="0"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Kurs Tavsifi *
            </label>
            <textarea
              id="course-description"
              v-model="courseForm.description"
              placeholder="Kurs haqida batafsil ma'lumot..."
              rows="3"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="md:col-span-2 flex justify-end">
            <button
              id="create-course-btn"
              type="submit"
              :disabled="courseLoading"
              class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/15"
            >
              <span v-if="courseLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ courseLoading ? "Saqlanmoqda..." : "Kursni Yaratish" }}</span>
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Loading State -->
    <div v-if="coursesLoading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Kurslar yuklanmoqda...</p>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
      ✅ {{ successMessage }}
    </div>

    <!-- Courses Table -->
    <div v-if="!coursesLoading && courses.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-800/60 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th class="px-6 py-4">Kurs Nomi</th>
              <th class="px-6 py-4">Davomiyligi</th>
              <th class="px-6 py-4">Narxi (UZS)</th>
              <th class="px-6 py-4">Holat</th>
              <th class="px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-slate-300">
            <tr
              v-for="course in courses"
              :key="course._id"
              class="hover:bg-slate-900/20 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-white max-w-xs truncate">{{ course.title }}</td>
              <td class="px-6 py-4 text-slate-400">{{ course.duration }}</td>
              <td class="px-6 py-4 font-semibold text-indigo-400">{{ Number(course.price).toLocaleString() }} UZS</td>
              <td class="px-6 py-4">
                <span v-if="course.status === 'ACTIVE'" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Faol
                </span>
                <span v-else class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Nofaol
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editingCourse = course"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
                    title="Tahrirlash"
                  >
                    ✏️
                  </button>
                  <button
                    @click="deleteCourse(course._id)"
                    :disabled="deletingId === course._id"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
                    title="O'chirish"
                  >
                    {{ deletingId === course._id ? "🔄" : "🗑️" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!coursesLoading && courses.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <p class="text-slate-400 text-lg">Hozircha kurslar mavjud emas</p>
      <NuxtLink to="/dashboard" class="text-sm text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-block">
        Dashboard ga o'tib kurs qo'shing →
      </NuxtLink>
    </div>
  </div>

  <!-- Edit Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="editingCourse" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="editingCourse = null">
        <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6">
          <!-- Close Button -->
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Kursni Tahrirlash</h2>
            <button
              @click="editingCourse = null"
              class="text-slate-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          <!-- Edit Form -->
          <form @submit.prevent="updateCourse" class="space-y-4">
            <!-- Course Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Kurs Nomi
              </label>
              <input
                v-model="editingCourse.title"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Davomiyligi
              </label>
              <input
                v-model="editingCourse.duration"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <!-- Price -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Oylik Narxi (UZS)
              </label>
              <input
                v-model.number="editingCourse.price"
                type="number"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tavsifi
              </label>
              <textarea
                v-model="editingCourse.description"
                rows="4"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
              ></textarea>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Holat
              </label>
              <select
                v-model="editingCourse.status"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Nofaol</option>
              </select>
            </div>

            <!-- Error in Form -->
            <div v-if="editError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {{ editError }}
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                @click="editingCourse = null"
                class="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-sm font-semibold transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                :disabled="updatingId === editingCourse._id"
                class="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                {{ updatingId === editingCourse._id ? "Saqlanmoqda..." : "Saqlash" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })

interface Course {
  _id: string
  title: string
  description: string
  duration: string
  price: number
  status: "ACTIVE" | "INACTIVE"
}

const coursesLoading = ref(true)
const courses = ref<Course[]>([])
const error = ref("")
const successMessage = ref("")
const editingCourse = ref<Course | null>(null)
const editError = ref("")
const deletingId = ref<string | null>(null)
const updatingId = ref<string | null>(null)

// ---- Course Form State ----
const showCourseForm = ref(false)
const courseLoading = ref(false)
const courseError = ref("")
const courseSuccess = ref(false)

const courseForm = reactive({
  title: "",
  description: "",
  duration: "",
  price: null as number | null
})

const createCourse = async () => {
  courseLoading.value = true
  courseError.value = ""
  courseSuccess.value = false

  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      courseError.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      courseLoading.value = false
      return
    }

    await $fetch("/api/v1/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.value}`
      },
      body: {
        title: courseForm.title,
        description: courseForm.description,
        duration: courseForm.duration,
        price: courseForm.price
      }
    })

    courseSuccess.value = true

    // Reset form
    courseForm.title = ""
    courseForm.description = ""
    courseForm.duration = ""
    courseForm.price = null

    // Refresh courses list
    await fetchCourses()

    // Auto-hide success message after 3 seconds
    setTimeout(() => { courseSuccess.value = false }, 3000)

  } catch (err: any) {
    courseError.value = err?.data?.message || "Kurs yaratishda xatolik yuz berdi."
  } finally {
    courseLoading.value = false
  }
}

// Fetch courses
const fetchCourses = async () => {
  coursesLoading.value = true
  error.value = ""

  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      error.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      coursesLoading.value = false
      return
    }

    const { data } = await $fetch<any>("/api/v1/courses?all=true", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    courses.value = data?.courses || []
  } catch (err: any) {
    error.value = err?.data?.message || "Kurslarni yuklashda xatolik yuz berdi"
  } finally {
    coursesLoading.value = false
  }
}

// Update course
const updateCourse = async () => {
  if (!editingCourse.value) return

  updatingId.value = editingCourse.value._id
  editError.value = ""

  try {
    const token = useCookie("auth_token")

    await $fetch(`/api/v1/courses/${editingCourse.value._id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token.value}`
      },
      body: {
        title: editingCourse.value.title,
        description: editingCourse.value.description,
        duration: editingCourse.value.duration,
        price: editingCourse.value.price,
        status: editingCourse.value.status
      }
    })

    successMessage.value = "Kurs muvaffaqiyatli o'zgartirildi!"
    editingCourse.value = null

    // Refresh courses
    await fetchCourses()

    // Clear success message after 3 seconds
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    editError.value = err?.data?.message || "Kursni o'zgartirishda xatolik yuz berdi"
  } finally {
    updatingId.value = null
  }
}

// Delete course
const deleteCourse = async (courseId: string) => {
  if (!confirm("Bu kursni o'chirmoqchisiz? Ushbu amalni qaytara olmaysiz!")) return

  deletingId.value = courseId
  error.value = ""

  try {
    const token = useCookie("auth_token")

    await $fetch(`/api/v1/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    successMessage.value = "Kurs muvaffaqiyatli o'chirildi!"

    // Refresh courses
    await fetchCourses()

    // Clear success message after 3 seconds
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    error.value = err?.data?.message || "Kursni o'chirishda xatolik yuz berdi"
  } finally {
    deletingId.value = null
  }
}

// Lifecycle
onMounted(() => {
  fetchCourses()
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
