<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">👨‍🏫 O'qituvchilar Boshqaruvi</h1>
        <p class="text-sm text-slate-400 mt-1">O'qituvchilar ro'yxati, ularning ma'lumotlari, faoliyat holati va parollarini boshqarish</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors border border-slate-700/60"
      >
        + Yangi O'qituvchi Qo'shish
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {{ error }}
    </div>
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
      ✅ {{ successMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">O'qituvchilar ma'lumotlari yuklanmoqda...</p>
    </div>

    <!-- Teachers Table -->
    <div v-if="!loading && teachers.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-800/60 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th class="px-6 py-4">Ism Familiya</th>
              <th class="px-6 py-4">Telefon</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Ma'lumoti & Tarjimai hol</th>
              <th class="px-6 py-4">Holat</th>
              <th class="px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-slate-300">
            <tr
              v-for="teacher in teachers"
              :key="teacher._id"
              class="hover:bg-slate-900/20 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
                    {{ teacher.firstname[0] }}{{ teacher.lastname[0] }}
                  </div>
                  <div>
                    <div class="font-medium text-white">{{ teacher.firstname }} {{ teacher.lastname }}</div>
                    <div class="text-xs text-slate-500">ID: {{ teacher._id.substring(18) }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-mono text-xs">{{ teacher.phone }}</td>
              <td class="px-6 py-4 text-slate-400 text-xs">{{ teacher.email || 'Kiritilmagan' }}</td>
              <td class="px-6 py-4 max-w-xs">
                <div class="text-xs font-semibold text-slate-300 truncate">{{ teacher.education || 'Ma\'lumoti yo\'q' }}</div>
                <div class="text-[11px] text-slate-500 truncate mt-0.5">{{ teacher.bio || 'Biografiya yo\'q' }}</div>
              </td>
              <td class="px-6 py-4">
                <select
                  v-model="teacher.status"
                  @change="updateStatus(teacher._id, teacher.status)"
                  class="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ACTIVE">Faol</option>
                  <option value="INACTIVE">Nofaol</option>
                  <option value="BANNED">Bloklangan</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <!-- Edit details -->
                  <button
                    @click="openEditModal(teacher)"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
                    title="Tahrirlash"
                  >
                    ✏️
                  </button>
                  <!-- Change password -->
                  <button
                    @click="openPasswordModal(teacher)"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-xs font-semibold transition-colors"
                    title="Parolni o'zgartirish"
                  >
                    🔑
                  </button>
                  <!-- Delete -->
                  <button
                    @click="deleteTeacher(teacher._id)"
                    :disabled="deletingId === teacher._id"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
                    title="O'chirish"
                  >
                    {{ deletingId === teacher._id ? "🔄" : "🗑️" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && teachers.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <p class="text-slate-400 text-lg">Hozircha o'qituvchilar mavjud emas</p>
      <button @click="openCreateModal" class="text-sm text-indigo-400 hover:text-indigo-300 font-semibold mt-3">
        Birinchi o'qituvchini qo'shing →
      </button>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreateModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-white">Yangi O'qituvchi Qo'shish</h2>
              <button @click="showCreateModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="createTeacher" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ism *</label>
                  <input v-model="createForm.firstname" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Familiya *</label>
                  <input v-model="createForm.lastname" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telefon raqami *</label>
                  <input v-model="createForm.phone" type="text" placeholder="+998901234567" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Parol *</label>
                  <input v-model="createForm.password" type="password" minlength="6" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fan (Kurs)</label>
                  <select v-model="createForm.subject" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                    <option value="">Fan tanlanmagan</option>
                    <option v-for="course in courses" :key="course._id" :value="course.title">{{ course.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tajriba (yil)</label>
                  <input v-model="createForm.experience" type="number" placeholder="5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sertifikat turi</label>
                  <input v-model="createForm.scoreType" type="text" placeholder="IELTS" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sertifikat balli</label>
                  <input v-model="createForm.score" type="text" placeholder="8.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">O'quvchilar soni</label>
                  <input v-model="createForm.studentsCount" type="text" placeholder="500+" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telegram Username</label>
                  <input v-model="createForm.telegram" type="text" placeholder="username" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>

              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ma'lumoti (Universitet)</label>
                <input v-model="createForm.education" type="text" placeholder="Masalan: TATU, bakalavr" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rasm (Avatar)</label>
                <input type="file" @change="handleFileUpload($event, createForm)" accept="image/*" class="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Qisqacha ma'lumot (Bio)</label>
                <textarea v-model="createForm.bio" rows="3" placeholder="Mutaxassisligi va tajribasi..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"></textarea>
              </div>

              <div v-if="modalError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {{ modalError }}
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showCreateModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submitting" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50">Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-white">Ma'lumotlarni Tahrirlash</h2>
              <button @click="showEditModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="updateTeacher" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ism *</label>
                  <input v-model="editForm.firstname" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Familiya *</label>
                  <input v-model="editForm.lastname" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telefon raqami *</label>
                  <input v-model="editForm.phone" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input v-model="editForm.email" type="email" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fan (Kurs)</label>
                  <select v-model="editForm.subject" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                    <option value="">Fan tanlanmagan</option>
                    <option v-for="course in courses" :key="course._id" :value="course.title">{{ course.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tajriba (yil)</label>
                  <input v-model="editForm.experience" type="number" placeholder="5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sertifikat turi</label>
                  <input v-model="editForm.scoreType" type="text" placeholder="IELTS" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sertifikat balli</label>
                  <input v-model="editForm.score" type="text" placeholder="8.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">O'quvchilar soni</label>
                  <input v-model="editForm.studentsCount" type="text" placeholder="500+" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telegram Username</label>
                  <input v-model="editForm.telegram" type="text" placeholder="username" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>

              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ma'lumoti (Universitet)</label>
                <input v-model="editForm.education" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rasm (Yangi yuklash)</label>
                <input type="file" @change="handleFileUpload($event, editForm)" accept="image/*" class="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Qisqacha ma'lumot (Bio)</label>
                <textarea v-model="editForm.bio" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"></textarea>
              </div>

              <div v-if="modalError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {{ modalError }}
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showEditModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submitting" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Change Password Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPasswordModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showPasswordModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-6" @click.stop>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-white">Parolni o'zgartirish</h2>
              <button @click="showPasswordModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  O'qituvchi: <span class="text-indigo-400 font-bold">{{ selectedTeacherName }}</span>
                </label>
                <input v-model="newPassword" type="password" placeholder="Yangi parol (kamida 6 belgi)" minlength="6" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div v-if="modalError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {{ modalError }}
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showPasswordModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submitting" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50">O'zgartirish</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })

interface Teacher {
  _id: string
  firstname: string
  lastname: string
  phone: string
  email?: string
  education?: string
  bio?: string
  subject?: string
  scoreType?: string
  score?: string
  experience?: number
  studentsCount?: string
  telegram?: string
  avatar?: string
  status: "ACTIVE" | "INACTIVE" | "BANNED"
}

const loading = ref(true)
const submitting = ref(false)
const teachers = ref<Teacher[]>([])
const error = ref("")
const successMessage = ref("")

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const modalError = ref("")

// Selected teacher properties
const selectedTeacherId = ref("")
const selectedTeacherName = ref("")
const newPassword = ref("")
const deletingId = ref<string | null>(null)

// Forms
const createForm = reactive({
  firstname: "",
  lastname: "",
  phone: "",
  email: "",
  password: "",
  education: "",
  bio: "",
  subject: "",
  scoreType: "",
  score: "",
  experience: null as number | null,
  studentsCount: "",
  telegram: "",
  avatar: null as File | null,
  status: "ACTIVE"
})

const editForm = reactive({
  firstname: "",
  lastname: "",
  phone: "",
  email: "",
  education: "",
  bio: "",
  subject: "",
  scoreType: "",
  score: "",
  experience: null as number | null,
  studentsCount: "",
  telegram: "",
  avatar: null as File | null
})

// Handle File Upload
const handleFileUpload = (event: Event, formRef: any) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formRef.avatar = target.files[0]
  }
}

// Fetch all teachers
const courses = ref<any[]>([])

const fetchCourses = async () => {
  try {
    const { data } = await $fetch<any>("/api/v1/courses", {
      method: "GET"
    })
    courses.value = data?.courses || []
  } catch (err: any) {
    console.error("Kurslarni yuklashda xatolik", err)
  }
}

const fetchTeachers = async () => {
  loading.value = true
  error.value = ""
  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      error.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      loading.value = false
      return
    }

    const { data } = await $fetch<any>("/api/v1/teachers", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    teachers.value = data?.teachers || []
  } catch (err: any) {
    error.value = err?.data?.message || "O'qituvchilarni yuklashda xatolik yuz berdi"
  } finally {
    loading.value = false
  }
}

// Open modals
const openCreateModal = () => {
  createForm.firstname = ""
  createForm.lastname = ""
  createForm.phone = ""
  createForm.email = ""
  createForm.password = ""
  createForm.education = ""
  createForm.bio = ""
  createForm.subject = ""
  createForm.scoreType = ""
  createForm.score = ""
  createForm.experience = null
  createForm.studentsCount = ""
  createForm.telegram = ""
  createForm.avatar = null
  modalError.value = ""
  showCreateModal.value = true
}

const openEditModal = (teacher: Teacher) => {
  selectedTeacherId.value = teacher._id
  editForm.firstname = teacher.firstname
  editForm.lastname = teacher.lastname
  editForm.phone = teacher.phone
  editForm.email = teacher.email || ""
  editForm.education = teacher.education || ""
  editForm.bio = teacher.bio || ""
  editForm.subject = teacher.subject || ""
  editForm.scoreType = teacher.scoreType || ""
  editForm.score = teacher.score || ""
  editForm.experience = teacher.experience || null
  editForm.studentsCount = teacher.studentsCount || ""
  editForm.telegram = teacher.telegram || ""
  editForm.avatar = null
  modalError.value = ""
  showEditModal.value = true
}

const openPasswordModal = (teacher: Teacher) => {
  selectedTeacherId.value = teacher._id
  selectedTeacherName.value = `${teacher.firstname} ${teacher.lastname}`
  newPassword.value = ""
  modalError.value = ""
  showPasswordModal.value = true
}

// Actions
const createTeacher = async () => {
  submitting.value = true
  modalError.value = ""
  try {
    const token = useCookie("auth_token")
    
    const formData = new FormData()
    formData.append("firstname", createForm.firstname)
    formData.append("lastname", createForm.lastname)
    formData.append("phone", createForm.phone)
    formData.append("password", createForm.password)
    if (createForm.email) formData.append("email", createForm.email)
    if (createForm.education) formData.append("education", createForm.education)
    if (createForm.bio) formData.append("bio", createForm.bio)
    if (createForm.subject) formData.append("subject", createForm.subject)
    if (createForm.scoreType) formData.append("scoreType", createForm.scoreType)
    if (createForm.score) formData.append("score", createForm.score)
    if (createForm.experience) formData.append("experience", String(createForm.experience))
    if (createForm.studentsCount) formData.append("studentsCount", createForm.studentsCount)
    if (createForm.telegram) formData.append("telegram", createForm.telegram)
    if (createForm.avatar) formData.append("avatar", createForm.avatar)
    if (createForm.status) formData.append("status", createForm.status)

    await $fetch("/api/v1/teachers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`
      },
      body: formData
    })

    successMessage.value = "O'qituvchi muvaffaqiyatli qo'shildi!"
    showCreateModal.value = false
    await fetchTeachers()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    modalError.value = err?.data?.message || "O'qituvchi yaratishda xatolik yuz berdi"
  } finally {
    submitting.value = false
  }
}

const updateTeacher = async () => {
  submitting.value = true
  modalError.value = ""
  try {
    const token = useCookie("auth_token")

    const formData = new FormData()
    formData.append("firstname", editForm.firstname)
    formData.append("lastname", editForm.lastname)
    formData.append("phone", editForm.phone)
    if (editForm.email) formData.append("email", editForm.email)
    if (editForm.education) formData.append("education", editForm.education)
    if (editForm.bio) formData.append("bio", editForm.bio)
    if (editForm.subject) formData.append("subject", editForm.subject)
    if (editForm.scoreType) formData.append("scoreType", editForm.scoreType)
    if (editForm.score) formData.append("score", editForm.score)
    if (editForm.experience) formData.append("experience", String(editForm.experience))
    if (editForm.studentsCount) formData.append("studentsCount", editForm.studentsCount)
    if (editForm.telegram) formData.append("telegram", editForm.telegram)
    if (editForm.avatar) formData.append("avatar", editForm.avatar)

    await $fetch(`/api/v1/teachers/${selectedTeacherId.value}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token.value}`
      },
      body: formData
    })

    successMessage.value = "O'qituvchi ma'lumotlari muvaffaqiyatli yangilandi!"
    showEditModal.value = false
    await fetchTeachers()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    modalError.value = err?.data?.message || "Tahrirlashda xatolik yuz berdi"
  } finally {
    submitting.value = false
  }
}

const updateStatus = async (teacherId: string, newStatus: string) => {
  error.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/teachers/${teacherId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.value}`
      },
      body: { status: newStatus }
    })

    successMessage.value = "Status muvaffaqiyatli o'zgartirildi!"
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    error.value = err?.data?.message || "Statusni yangilashda xatolik yuz berdi"
    await fetchTeachers() // Revert change in UI
  }
}

const changePassword = async () => {
  submitting.value = true
  modalError.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/teachers/${selectedTeacherId.value}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.value}`
      },
      body: { password: newPassword.value }
    })

    successMessage.value = "O'qituvchi paroli muvaffaqiyatli o'zgartirildi!"
    showPasswordModal.value = false
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    modalError.value = err?.data?.message || "Parolni yangilashda xatolik yuz berdi"
  } finally {
    submitting.value = false
  }
}

const deleteTeacher = async (teacherId: string) => {
  if (!confirm("Haqiqatan ham bu o'qituvchini o'chirmoqchisiz?")) return

  deletingId.value = teacherId
  error.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/teachers/${teacherId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    successMessage.value = "O'qituvchi muvaffaqiyatli o'chirildi!"
    await fetchTeachers()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    error.value = err?.data?.message || "O'qituvchini o'chirishda xatolik yuz berdi"
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  fetchCourses()
  fetchTeachers()
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
