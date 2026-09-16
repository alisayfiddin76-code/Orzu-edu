<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">👥 Guruhlar Boshqaruvi</h1>
        <p class="text-sm text-slate-400 mt-1">Guruhlar ro'yxati, dars kunlari, xonalar va biriktirilgan o'qituvchilar</p>
      </div>
      <NuxtLink
        to="/dashboard/groups/create"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
      >
        + Yangi Guruh Qo'shish
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Guruhlar yuklanmoqda...</p>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
      {{ error }}
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
      ✅ {{ successMessage }}
    </div>

    <!-- Groups Table -->
    <div v-if="!loading && groups.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-800/60 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th class="px-6 py-4">Guruh nomi</th>
              <th class="px-6 py-4">Kurs</th>
              <th class="px-6 py-4">O'qituvchi</th>
              <th class="px-6 py-4">Kunlar</th>
              <th class="px-6 py-4">Vaqt & Xona</th>
              <th class="px-6 py-4">O'quvchilar soni</th>
              <th class="px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-slate-300">
            <tr
              v-for="group in groups"
              :key="group._id"
              class="hover:bg-slate-900/20 transition-colors"
            >
              <td class="px-6 py-4 font-semibold text-white max-w-xs truncate">{{ group.title }}</td>
              <td class="px-6 py-4 text-slate-400">
                {{ group.course ? group.course.title : "Kurs biriktirilmagan" }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 min-w-[150px]">
                  <div v-if="group.teacher" class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400 border border-slate-750">
                      {{ group.teacher.firstname ? group.teacher.firstname[0] : '' }}{{ group.teacher.lastname ? group.teacher.lastname[0] : '' }}
                    </div>
                    <span class="text-white">{{ group.teacher.firstname }} {{ group.teacher.lastname }}</span>
                  </div>
                  <span v-else class="text-rose-450 text-xs font-medium">O'qituvchi yo'q</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="group.days === 'ODD'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Duy, Chor, Jum
                </span>
                <span v-else-if="group.days === 'EVEN'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Se, Pay, Shan
                </span>
                <span v-else-if="group.days === 'EVERYDAY'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Har kuni
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                  Maxsus
                </span>
              </td>
              <td class="px-6 py-4 text-slate-400">
                <div class="font-medium text-slate-300">{{ group.start_time }} - {{ group.end_time }}</div>
                <div class="text-xs text-slate-550">Xona: {{ group.room || "Noma'lum" }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                  {{ group.students ? group.students.length : 0 }} ta o'quvchi
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    v-if="userRole === 'SUPER_ADMIN'"
                    @click="openEditGroupModal(group)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
                    title="Guruhni tahrirlash"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="userRole === 'SUPER_ADMIN'"
                    @click="deleteGroup(group._id)"
                    :disabled="deletingId === group._id"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
                    title="Guruhni o'chirish"
                  >
                    {{ deletingId === group._id ? "🔄" : "🗑️" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && groups.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <p class="text-slate-400 text-lg">Hozircha guruhlar mavjud emas</p>
      <NuxtLink to="/dashboard/groups/create" class="text-sm text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-block">
        Birinchi guruhni yarating →
      </NuxtLink>
    </div>

    <!-- MODAL: Edit Group -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal && selectedGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="closeEditModal">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200" @click.stop>
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 class="text-lg font-bold text-white">✏️ Guruhni Tahrirlash</h2>
              <button @click="closeEditModal" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <div v-if="optionsLoading" class="text-center py-6 text-slate-400 flex flex-col items-center">
              <div class="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
              Ma'lumotlar yuklanmoqda...
            </div>

            <form v-else @submit.prevent="submitEditGroup" class="space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Guruh Nomi *</label>
                <input 
                  v-model="editForm.title"
                  type="text"
                  required
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <!-- Course and Teacher -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kurs *</label>
                  <select 
                    v-model="editForm.course"
                    required
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>-- Tanlang --</option>
                    <option v-for="c in activeCourses" :key="c._id" :value="c._id">{{ c.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">O'qituvchi *</label>
                  <select 
                    v-model="editForm.teacher"
                    required
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>-- Tanlang --</option>
                    <option v-for="t in activeTeachers" :key="t._id" :value="t._id">{{ t.firstname }} {{ t.lastname }}</option>
                  </select>
                </div>
              </div>

              <!-- Days and Room -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kunlar *</label>
                  <select 
                    v-model="editForm.days"
                    required
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ODD">Du-Chor-Jum (Toq)</option>
                    <option value="EVEN">Se-Pay-Shan (Juft)</option>
                    <option value="EVERYDAY">Har kuni</option>
                    <option value="CUSTOM">Maxsus</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Xona *</label>
                  <input 
                    v-model="editForm.room"
                    type="text"
                    required
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <!-- Time -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Boshlanish *</label>
                  <input 
                    v-model="editForm.start_time"
                    type="time"
                    required
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tugash *</label>
                  <input 
                    v-model="editForm.end_time"
                    type="time"
                    required
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div v-if="editError" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs">
                {{ editError }}
              </div>

              <div class="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button type="button" @click="closeEditModal" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-colors">Bekor qilish</button>
                <button 
                  type="submit" 
                  :disabled="updatingGroup" 
                  class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <span v-if="updatingGroup" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {{ updatingGroup ? 'Saqlanmoqda...' : 'Saqlash' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: "admin" })

const _roleCookie = useCookie('auth_role')
const userRole = computed(() => _roleCookie.value || 'SUPER_ADMIN')

interface Group {
  _id: string
  title: string
  room: string
  start_time: string
  end_time: string
  days: "ODD" | "EVEN" | "EVERYDAY" | "CUSTOM"
  course: {
    _id: string
    title: string
    description: string
  }
  teacher: {
    _id: string
    firstname: string
    lastname: string
    email: string
    phone: string
  }
  students: string[]
}

const loading = ref(true)
const groups = ref<Group[]>([])
const error = ref("")
const successMessage = ref("")
const deletingId = ref<string | null>(null)

// ---- Edit Group Modal state ----
const showEditModal = ref(false)
const selectedGroup = ref<Group | null>(null)
const editForm = ref({
  title: "",
  course: "",
  teacher: "",
  days: "ODD",
  start_time: "",
  end_time: "",
  room: ""
})

const courses = ref<any[]>([])
const teachers = ref<any[]>([])
const optionsLoading = ref(false)
const updatingGroup = ref(false)
const editError = ref("")

const activeTeachers = computed(() => teachers.value.filter((t: any) => t.status === "ACTIVE"))
const activeCourses = computed(() => courses.value.filter((c: any) => c.status === "ACTIVE"))

// Fetch groups
const fetchGroups = async () => {
  loading.value = true
  error.value = ""

  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      error.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      loading.value = false
      return
    }

    const { data } = await $fetch<any>("/api/v1/groups", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    groups.value = data?.groups || []
  } catch (err: any) {
    error.value = err?.data?.message || "Guruhlarni yuklashda xatolik yuz berdi"
  } finally {
    loading.value = false
  }
}

// Delete group
const deleteGroup = async (groupId: string) => {
  if (!confirm("Haqiqatan ham bu guruhni o'chirmoqchisiz?")) return

  deletingId.value = groupId
  error.value = ""

  try {
    const token = useCookie("auth_token")

    await $fetch(`/api/v1/groups/${groupId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    successMessage.value = "Guruh muvaffaqiyatli o'chirildi!"
    await fetchGroups()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    error.value = err?.data?.message || "Guruhni o'chirishda xatolik yuz berdi"
  } finally {
    deletingId.value = null
  }
}

// Open Edit Group Modal
const openEditGroupModal = async (group: Group) => {
  selectedGroup.value = group
  editForm.value = {
    title: group.title || "",
    course: group.course?._id || "",
    teacher: group.teacher?._id || "",
    days: group.days || "ODD",
    start_time: group.start_time || "",
    end_time: group.end_time || "",
    room: group.room || ""
  }
  showEditModal.value = true
  editError.value = ""
  
  if (teachers.value.length === 0 || courses.value.length === 0) {
    optionsLoading.value = true
    try {
      const token = useCookie("auth_token")
      const [teachersRes, coursesRes] = await Promise.all([
        $fetch<any>("/api/v1/teachers", { headers: { Authorization: `Bearer ${token.value}` } }),
        $fetch<any>("/api/v1/courses?all=true", { headers: { Authorization: `Bearer ${token.value}` } })
      ])
      teachers.value = teachersRes?.data?.teachers || []
      courses.value = coursesRes?.data?.courses || []
    } catch (err) {
      editError.value = "Ma'lumotlarni yuklashda xatolik yuz berdi"
    } finally {
      optionsLoading.value = false
    }
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedGroup.value = null
  editError.value = ""
}

const submitEditGroup = async () => {
  if (!selectedGroup.value) return
  
  updatingGroup.value = true
  editError.value = ""
  
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/groups/${selectedGroup.value._id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json"
      },
      body: editForm.value
    })
    
    successMessage.value = "Guruh muvaffaqiyatli tahrirlandi!"
    closeEditModal()
    await fetchGroups()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    editError.value = err?.data?.message || "Guruhni tahrirlashda xatolik yuz berdi"
  } finally {
    updatingGroup.value = false
  }
}

onMounted(() => {
  fetchGroups()
})
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
