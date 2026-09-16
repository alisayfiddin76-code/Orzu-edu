<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">🎯 Lidlar va O'quvchilar</h1>
        <p class="text-sm text-slate-400 mt-1">Yangi arizalar va roʻyxatdan oʻtgan oʻquvchilar</p>
      </div>
      <NuxtLink to="/dashboard" class="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
        ← Dashboard ga qaytish
      </NuxtLink>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-2">
      <button
        @click="activeTab = 'leads'"
        :class="[
          'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
          activeTab === 'leads'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
        ]"
      >
        📋 Yangi Arizalar ({{ leadsCount }})
      </button>
      <button
        @click="activeTab = 'students'"
        :class="[
          'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
          activeTab === 'students'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
        ]"
      >
        🎓 Ro'yxatdan O'tgan O'quvchilar ({{ studentsCount }})
      </button>
    </div>

    <!-- ======== LEADS TAB ======== -->
    <div v-if="activeTab === 'leads'" class="space-y-4">
      <!-- Loading -->
      <div v-if="leadsLoading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-slate-400">Arizalar yuklanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="leads.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <p class="text-slate-400 text-lg">Yangi arizalar mavjud emas</p>
      </div>

      <!-- Leads Table -->
      <div v-else class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-800/60 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th class="px-6 py-4">Ism Familiya</th>
                <th class="px-6 py-4">Telefon</th>
                <th class="px-6 py-4">Kurs</th>
                <th class="px-6 py-4">Manba</th>
                <th class="px-6 py-4">Holat</th>
                <th class="px-6 py-4">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40 text-slate-300">
              <tr v-for="lead in leads" :key="lead._id" class="hover:bg-slate-900/20 transition-colors">
                <td class="px-6 py-4 font-medium text-white">{{ lead.fullname }}</td>
                <td class="px-6 py-4 font-mono text-xs">{{ formatPhoneNumber(lead.phone) }}</td>
                <td class="px-6 py-4 text-sm truncate">{{ lead.course || "—" }}</td>
                <td class="px-6 py-4">
                  <span class="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{{ lead.source }}</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="getStatusClass(lead.status)">{{ formatStatus(lead.status) }}</span>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="convertingLeadId = lead._id; showConvertModal = true"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors"
                    title="Studentga aylantirish"
                  >
                    ✓ Studentga
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ======== STUDENTS TAB ======== -->
    <div v-if="activeTab === 'students'" class="space-y-4">
      <!-- Loading -->
      <div v-if="studentsLoading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-slate-400">O'quvchilar yuklanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="students.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <p class="text-slate-400 text-lg">Ro'yxatdan o'tgan o'quvchilar mavjud emas</p>
      </div>

      <!-- Students Table -->
      <div v-else class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-800/60 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th class="px-6 py-4">Ism Familiya</th>
                <th class="px-6 py-4">Telefon (Login)</th>
                <th class="px-6 py-4">Tanlangan Kurs</th>
                <th class="px-6 py-4">Holat</th>
                <th class="px-6 py-4">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40 text-slate-300">
              <tr v-for="student in students" :key="student._id" class="hover:bg-slate-900/20 transition-colors">
                <td class="px-6 py-4 font-medium text-white">
                  {{ student.user.firstname }} {{ student.user.lastname }}
                </td>
                <td class="px-6 py-4 text-xs font-mono">{{ formatPhoneNumber(student.user.phone) }}</td>
                <td class="px-6 py-4 text-sm font-semibold text-indigo-400">
                  {{ student.lead?.course || student.course || "—" }}
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Faol
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="selectedStudent = student; showGroupModal = true"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
                    title="Guruhga qo'shish"
                  >
                    👥 Guruhga Qo'shish
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
      ✅ {{ successMessage }}
    </div>
  </div>

  <!-- Convert to Student Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showConvertModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showConvertModal = false">
        <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Studentga Aylantirish</h2>
            <button @click="showConvertModal = false" class="text-slate-400 hover:text-white text-2xl">✕</button>
          </div>

          <p class="text-slate-300 text-sm">
            Bu arizani ro'yxatdan o'tgan talabaga aylantirish uchun uni confirm qiling. Unga parol avtomatik yaratiladi.
          </p>

          <div v-if="convertError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ convertError }}
          </div>

          <div class="flex gap-3 justify-end">
            <button
              @click="showConvertModal = false"
              class="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-sm font-semibold"
            >
              Bekor qilish
            </button>
            <button
              @click="convertLeadToStudent"
              :disabled="converting"
              class="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {{ converting ? "Qayta ktilyapti..." : "Ha, Confirm" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Assign to Group Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showGroupModal && selectedStudent" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showGroupModal = false">
        <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Guruhga Qo'shish</h2>
            <button @click="showGroupModal = false" class="text-slate-400 hover:text-white text-2xl">✕</button>
          </div>

          <div class="bg-slate-900/40 border border-slate-800/80 rounded-lg p-4">
            <p class="text-sm text-slate-300">
              <span class="font-semibold">O'quvchi:</span> {{ selectedStudent.user.firstname }} {{ selectedStudent.user.lastname }}
            </p>
            <p class="text-sm text-slate-300 mt-2">
              <span class="font-semibold">Login (Telefon):</span> <span class="font-mono">{{ formatPhoneNumber(selectedStudent.user.phone) }}</span>
            </p>
            <p class="text-sm text-slate-300 mt-2">
              <span class="font-semibold">Tanlangan kurs:</span> <span class="text-indigo-400 font-bold">{{ selectedStudent.lead?.course || selectedStudent.course || 'Noma\'lum' }}</span>
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Guruhni Tanlang *
            </label>
            <select
              v-model="selectedGroupId"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            >
              <option value="" disabled>— Guruhni tanlang —</option>
              <optgroup v-for="(groupsList, courseName) in groupedAvailableGroups" :key="courseName" :label="courseName">
                <option v-for="group in groupsList" :key="group._id" :value="group._id">
                  {{ group.title }}
                </option>
              </optgroup>
            </select>
          </div>

          <div v-if="assignError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ assignError }}
          </div>

          <div class="flex gap-3 justify-end">
            <button
              @click="showGroupModal = false"
              class="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-sm font-semibold"
            >
              Bekor qilish
            </button>
            <button
              @click="assignStudentToGroup"
              :disabled="!selectedGroupId || assigning"
              class="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {{ assigning ? "Qo'shilmoqda..." : "Guruhga Qo'shish" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })

interface Lead {
  _id: string
  fullname: string
  phone: string
  course: string
  source: string
  status: string
  birthDate?: string
}

interface Student {
  _id: string
  user: {
    firstname: string
    lastname: string
    phone: string
  }
  course?: string
  lead?: {
    fullname: string
    course?: string
  }
}

interface Group {
  _id: string
  title: string
  course: {
    title: string
  }
  teacher: {
    firstname: string
    lastname: string
  }
}

const activeTab = ref<"leads" | "students">("leads")
const leadsLoading = ref(true)
const studentsLoading = ref(false)
const leads = ref<Lead[]>([])
const students = ref<Student[]>([])
const availableGroups = ref<Group[]>([])
const error = ref("")
const successMessage = ref("")

// Phone Formatter
const formatPhoneNumber = (phone: string | undefined | null) => {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;
  const body = cleaned.slice(-9);
  const prefix = cleaned.slice(0, -9) || '998';
  return `+${prefix} ${body.slice(0, 2)} ${body.slice(2, 5)} ${body.slice(5, 7)} ${body.slice(7, 9)}`;
}

// Convert to student
const showConvertModal = ref(false)
const convertingLeadId = ref<string | null>(null)
const converting = ref(false)
const convertError = ref("")

// Assign to group
const showGroupModal = ref(false)
const selectedStudent = ref<Student | null>(null)
const selectedGroupId = ref("")
const assigning = ref(false)
const assignError = ref("")

const leadsCount = computed(() => leads.value.length)
const studentsCount = computed(() => students.value.length)

// Fetch leads
const fetchLeads = async () => {
  leadsLoading.value = true
  error.value = ""

  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      error.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      leadsLoading.value = false
      return
    }
    const { data } = await $fetch<any>("/api/v1/leads", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })
    leads.value = data?.leads || []
  } catch (err: any) {
    error.value = err?.data?.message || "Arizalarni yuklashda xatolik yuz berdi"
  } finally {
    leadsLoading.value = false
  }
}

// Fetch registered students
const fetchStudents = async () => {
  studentsLoading.value = true

  try {
    const token = useCookie("auth_token")
    const { data } = await $fetch<any>("/api/v1/students/registered-only", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })
    students.value = data?.students || []
  } catch (err: any) {
    error.value = err?.data?.message || "O'quvchilarni yuklashda xatolik yuz berdi"
  } finally {
    studentsLoading.value = false
  }
}

// Fetch available groups
const fetchGroups = async () => {
  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      error.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      return
    }
    const { data } = await $fetch<any>("/api/v1/groups", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })
    availableGroups.value = data?.groups || []
  } catch (err: any) {
    error.value = err?.data?.message || "Guruhlarni yuklashda xatolik yuz berdi"
  }
}

// Guruhlarni kurs nomlari bo'yicha guruhlash
const groupedAvailableGroups = computed(() => {
  const groupsByCourse: Record<string, any[]> = {};
  availableGroups.value.forEach((group: any) => {
    const courseTitle = typeof group.course === 'object' ? group.course?.title : (group.course || 'Boshqa');
    if (!groupsByCourse[courseTitle]) {
      groupsByCourse[courseTitle] = [];
    }
    groupsByCourse[courseTitle].push(group);
  });
  return groupsByCourse;
});

// Modal ochilganda avtomatik ravishda mos guruhni tanlash
watch(showGroupModal, (newVal: boolean) => {
  if (newVal && selectedStudent.value) {
    const studentCourse = selectedStudent.value.lead?.course || selectedStudent.value.course;
    
    // Agar o'quvchining kursi bo'yicha guruh topilsa, birinchisini avtomatik tanlab qo'yish
    if (studentCourse && (groupedAvailableGroups.value[studentCourse]?.length ?? 0) > 0) {
      selectedGroupId.value = groupedAvailableGroups.value[studentCourse]![0]._id;
    } else {
      selectedGroupId.value = "";
    }
  }
});

// Convert lead to student
const convertLeadToStudent = async () => {
  if (!convertingLeadId.value) return

  converting.value = true
  convertError.value = ""

  try {
    const token = useCookie("auth_token")
    const lead = leads.value.find((l: any) => l._id === convertingLeadId.value)
    if (!lead) return

    // Parse firstname and lastname from fullname
    const nameParts = lead.fullname.trim().split(/\s+/)
    const firstname = nameParts[0]
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Talaba"

    await $fetch(`/api/v1/students/from-lead/${convertingLeadId.value}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`
      },
      body: {
        firstname,
        lastname,
        phone: lead.phone,
        // birthDate Lead modelidan avtomatik olinadi (backendda lead.birthDate ishlatiladi)
        // Agar Lead da birthDate bo'lsa, u parol bo'ladi. Yo'q bo'lsa admin kiritishi kerak.
        birthDate: lead.birthDate || null
      }
    })

    const loginInfo = lead.birthDate
      ? `Login: ${lead.phone} | Parol: ${lead.birthDate.replace(/-/g, '')}`
      : `Login: ${lead.phone} | Parol: (birthDate kiritilmagan)`

    successMessage.value = `${lead.fullname} muvaffaqiyatli talabaga aylantirildi! ${loginInfo}`
    showConvertModal.value = false

    // Refresh data
    await fetchLeads()
    await fetchStudents()

    setTimeout(() => { successMessage.value = "" }, 8000)
  } catch (err: any) {
    convertError.value = err?.data?.message || "Xatolik yuz berdi"
  } finally {
    converting.value = false
  }
}

// Assign student to group
const assignStudentToGroup = async () => {
  if (!selectedStudent.value || !selectedGroupId.value) return

  assigning.value = true
  assignError.value = ""

  try {
    const token = useCookie("auth_token")

    await $fetch(
      `/api/v1/students/${selectedStudent.value._id}/assign-group/${selectedGroupId.value}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.value}`
        }
      }
    )

    const studentName = selectedStudent.value.user.firstname

    showGroupModal.value = false
    selectedStudent.value = null
    selectedGroupId.value = ""

    // Serverdan yangilab olamiz — guruhga qo'shilganlar avtomatik olib tashlanadi
    await fetchStudents()

    successMessage.value = `${studentName} guruhga muvaffaqiyatli qo'shildi!`
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    assignError.value = err?.data?.message || "Xatolik yuz berdi"
  } finally {
    assigning.value = false
  }
}

// Helper functions
const formatStatus = (status: string): string => {
  const map: Record<string, string> = {
    "NEW": "Yangi",
    "CALLED": "Qo'ng'iroq qilingan",
    "INTERESTED": "Qiziqmoqda",
    "DEMO": "Demo suhbat",
    "REGISTERED": "Ro'yxatdan o'tgan",
    "REJECTED": "Rad qilingan"
  }
  return map[status] || status
}

const getStatusClass = (status: string): string => {
  if (status === "REGISTERED") return "inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400"
  if (status === "REJECTED") return "inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400"
  return "inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400"
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchLeads(), fetchGroups()])
})

watch(() => activeTab.value, async (newTab: string) => {
  if (newTab === "students" && students.value.length === 0) {
    await fetchStudents()
  }
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
