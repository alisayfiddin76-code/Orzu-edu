<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/70">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <span class="text-lg font-bold">ORZU EDU - Talaba Kabineti</span>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-sm">
            <p class="font-semibold">{{ userInfo?.firstname }} {{ userInfo?.lastname }}</p>
            <p class="text-xs text-slate-500">{{ userInfo?.phone }}</p>
          </div>
          <button
            @click="logout"
            class="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 text-sm font-semibold transition-colors"
          >
            Chiqish 🚪
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-12">
      <!-- Welcome Section -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-2">Xush kelibsiz, {{ userInfo?.firstname }}! 👋</h1>
        <p class="text-slate-400">Sizning kurslaringiz va vazifalaringizni ko'rish uchun quyida o'tib ko'ring.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-slate-400">Guruhlar yuklanmoqda...</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
        {{ error }}
      </div>

      <!-- Groups List -->
      <div v-if="!loading && groups.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="group in groups"
          :key="group._id"
          class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-indigo-500/30 transition-colors shadow-lg"
        >
          <!-- Group Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-bold text-white">{{ group.title }}</h3>
              <p class="text-sm text-slate-400 mt-1">📚 {{ group.course?.title }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
              👥
            </div>
          </div>

          <!-- Group Details -->
          <div class="space-y-3 mb-6">
            <!-- Teacher -->
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <span class="text-xl">👨‍🏫</span>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">O'qituvchi</p>
                <p class="text-sm font-semibold text-white">{{ group.teacher?.firstname }} {{ group.teacher?.lastname }}</p>
              </div>
            </div>

            <!-- Schedule -->
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <span class="text-xl">📅</span>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dars Vaqti</p>
                <p class="text-sm font-semibold text-white">
                  {{ group.start_time }} - {{ group.end_time }} ({{ formatDays(group.days) }})
                </p>
              </div>
            </div>

            <!-- Room -->
            <div v-if="group.room" class="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <span class="text-xl">🏢</span>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Xona</p>
                <p class="text-sm font-semibold text-white">{{ group.room }}</p>
              </div>
            </div>

            <!-- Students Count -->
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <span class="text-xl">👫</span>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Guruh Hajmi</p>
                <p class="text-sm font-semibold text-white">{{ group.students?.length || 0 }} ta talaba</p>
              </div>
            </div>
          </div>

          <!-- Course Description -->
          <div class="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 mb-4">
            <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Kurs Tavsifi</p>
            <p class="text-sm text-slate-300 line-clamp-2">{{ group.course?.description }}</p>
          </div>

          <!-- Action Buttons (Future) -->
          <div class="flex gap-3">
            <button
              disabled
              class="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 text-sm font-semibold cursor-not-allowed opacity-50"
            >
              📝 Vazifalar (Tez orada)
            </button>
            <button
              disabled
              class="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 text-sm font-semibold cursor-not-allowed opacity-50"
            >
              📊 Baholar (Tez orada)
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && groups.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
        <div class="text-5xl mb-4">📚</div>
        <p class="text-slate-400 text-lg">Hozircha biron guruhga qo'shilmagansiz</p>
        <p class="text-slate-500 text-sm mt-2">Admin sizni biron guruhga qo'shgach, bu yerdan ko'rish mumkin bo'ladi</p>
      </div>

      <!-- Invoices / Payments Section -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">💳 Mening To'lovlarim</h2>
        
        <div v-if="invoicesLoading" class="py-8 text-center">
          <div class="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-slate-400 text-sm">To'lovlar yuklanmoqda...</p>
        </div>

        <div v-else-if="invoices.length > 0" class="rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden shadow-lg">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="bg-slate-900/60 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                  <th class="px-6 py-4 font-semibold">Oy</th>
                  <th class="px-6 py-4 font-semibold">Guruh / Fan</th>
                  <th class="px-6 py-4 font-semibold">Summa</th>
                  <th class="px-6 py-4 font-semibold">Holat</th>
                  <th class="px-6 py-4 font-semibold text-right">To'lov sanasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/40">
                <tr v-for="inv in invoices" :key="inv._id" class="hover:bg-slate-900/30 transition-colors">
                  <td class="px-6 py-4 font-bold text-white">{{ inv.month }}</td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-slate-200">{{ inv.group?.title }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-mono text-white">{{ new Intl.NumberFormat('uz-UZ').format(inv.final_amount || inv.amount) }} so'm</span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      :class="inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                    >
                      {{ inv.status === 'PAID' ? 'To\'langan' : 'To\'lanmagan' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-slate-400 text-xs">
                    {{ inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
          <p class="text-slate-400">Hali hech qanday to'lovlar shakllanmagan.</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-900/80 mt-16 py-8 px-6 text-center text-sm text-slate-500">
      <p>© {{ new Date().getFullYear() }} ORZU EDU. Barcha huquqlar himoyalangan.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Group {
  _id: string
  title: string
  start_time: string
  end_time: string
  days: string
  room?: string
  course: {
    title: string
    description: string
    duration: string
  }
  teacher: {
    firstname: string
    lastname: string
  }
  students: any[]
}

const router = useRouter()
const loading = ref(true)
const invoicesLoading = ref(true)
const error = ref("")
const groups = ref<Group[]>([])
const invoices = ref<any[]>([])
const userInfo = ref<any>(null)

// Get user info from token
const getUserInfo = async () => {
  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      router.push('/student/login')
      return
    }

    // Decode JWT to get user info (basic decoding)
    // In production, you should also verify with backend
    const base64Url = (token.value as string).split('.')[1]
    const base64 = (base64Url || '').replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const decoded = JSON.parse(jsonPayload)

    // Fetch full user details
    const { data } = await $fetch<any>("/api/v1/students/my-groups", {
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    userInfo.value = {
      firstname: "O'quvchi",
      lastname: "",
      phone: "—"
    }
  } catch (err) {
    console.error("User info error:", err)
  }
}

// Fetch student's groups
const fetchGroups = async () => {
  loading.value = true
  error.value = ""

  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      router.push('/student/login')
      return
    }

    const { data } = await $fetch<any>("/api/v1/students/my-groups", {
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    groups.value = data?.groups || []
  } catch (err: any) {
    if (err.status === 401) {
      router.push('/student/login')
    }
    error.value = err?.data?.message || "Guruhlarni yuklashda xatolik yuz berdi"
  } finally {
    loading.value = false
  }
}

// Fetch student's invoices
const fetchInvoices = async () => {
  invoicesLoading.value = true
  try {
    const token = useCookie("auth_token")
    if (!token.value) return

    const { data } = await $fetch<any>("/api/v1/students/my-invoices", {
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    invoices.value = data?.invoices || []
  } catch (err: any) {
    console.error("To'lovlarni yuklashda xatolik:", err)
    // Token xatosi bo'lsa loginga yo'naltirish
    if (err?.status === 401 || err?.statusCode === 401) {
      const token = useCookie("auth_token")
      token.value = null
      router.push('/student/login')
    }
  } finally {
    invoicesLoading.value = false
  }
}

// Helper function to format days
const formatDays = (days: string): string => {
  const map: Record<string, string> = {
    "ODD": "Duy, Chor, Jum",
    "EVEN": "Se, Pay, Shan",
    "EVERYDAY": "Har kuni",
    "CUSTOM": "Belgilangan kunlar"
  }
  return map[days] || days
}

// Logout function
const logout = () => {
  const token = useCookie("auth_token")
  token.value = null
  router.push("/login")
}

// Lifecycle
onMounted(async () => {
  await getUserInfo()
  await fetchGroups()
  await fetchInvoices()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
