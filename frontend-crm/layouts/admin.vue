<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans flex overflow-hidden">

    <!-- ============ SIDEBAR ============ -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0">

      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <div>
            <span class="text-md font-bold tracking-tight text-white">ORZU CRM</span>
            <p class="text-[9px] text-slate-500 tracking-wider uppercase font-semibold">Boshqaruv Paneli</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div ref="sidebarNav" class="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        <div>
          <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-3">Asosiy</h4>
          <nav class="space-y-1">
            <NuxtLink
              v-for="item in filteredMainNav"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors duration-200 border border-transparent"
              active-class="bg-indigo-600/10 !text-indigo-400 border-indigo-500/20 !font-bold shadow-sm"
            >
              <span class="text-lg">{{ item.icon }}</span>
              {{ item.name }}
            </NuxtLink>
          </nav>
        </div>

        <div v-for="section in filteredRoleSections" :key="section.title">
          <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-3">
            {{ section.title }}
          </h4>
          <nav class="space-y-1">
            <NuxtLink
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors duration-200 border border-transparent"
              active-class="bg-indigo-600/10 !text-indigo-400 border-indigo-500/20 !font-bold shadow-sm"
            >
              <span class="text-lg">{{ item.icon }}</span>
              {{ item.name }}
            </NuxtLink>
          </nav>
        </div>
      </div>

      <!-- User Info + Logout -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/40">
        <div class="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            {{ userName[0] || 'A' }}{{ userName.split(' ')[1]?.[0] || '' }}
          </div>
          <div class="flex-grow min-w-0">
            <h4 class="text-xs font-semibold text-white truncate">{{ userName }}</h4>
            <p class="text-[10px] text-slate-500 truncate">{{ userEmail }}</p>
          </div>
          <button
            class="text-slate-400 hover:text-red-400 transition-colors duration-200"
            title="Chiqish"
            @click="logout"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>

    <!-- ============ MAIN CONTENT AREA ============ -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Top Header -->
      <header class="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-10">
        <div class="flex items-center gap-4">
          <button class="lg:hidden text-slate-400 hover:text-white focus:outline-none">
            ☰
          </button>
          <h1 class="text-lg font-bold tracking-tight text-white">Boshqaruv Tizimi</h1>
        </div>

        <div class="flex items-center gap-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
            Tizim faol
          </span>
          <div class="w-px h-6 bg-slate-800"></div>
          <button @click="router.push('/dashboard/finance/debtors')" class="text-slate-400 hover:text-white relative transition-colors duration-200">
            🔔
            <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-3.5 px-1 bg-rose-500 text-[9px] font-bold text-white rounded-full border border-slate-950 animate-bounce">
              {{ notificationCount }}
            </span>
          </button>
        </div>
      </header>

      <!-- Page Content via <slot /> -->
      <main class="flex-1 overflow-y-auto bg-slate-900 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sidebarNav = ref<HTMLElement | null>(null)
const savedScroll = useCookie('sidebar_scroll', { default: () => 0 })
const notificationCount = ref(0)
const authToken = useCookie('auth_token')

const fetchNotifications = async () => {
  try {
    const res = await fetch('/api/v1/finance/invoices/notifications', {
      headers: {
        Authorization: `Bearer ${authToken.value}`
      }
    })
    const data = await res.json()
    if (data.status === 'success') {
      notificationCount.value = data.data.count
    }
  } catch (error) {
    console.error('Bildirishnomalarni olishda xatolik:', error)
  }
}

watch(() => route.path, () => {
  if (sidebarNav.value) {
    savedScroll.value = sidebarNav.value.scrollTop
  }
})

const userRole = ref("SUPER_ADMIN")
const userName = ref("Administrator")
const userEmail = ref("admin@orzuedu.uz")

onMounted(() => {
  const roleCookie = useCookie("auth_role")
  const nameCookie = useCookie("auth_name")
  const emailCookie = useCookie("auth_email")

  if (roleCookie.value) userRole.value = roleCookie.value
  if (nameCookie.value) userName.value = nameCookie.value
  if (emailCookie.value) userEmail.value = emailCookie.value

  // Fetch notifications if user is finance admin or super admin
  if (userRole.value === 'SUPER_ADMIN' || userRole.value === 'FINANCE_ADMIN') {
    fetchNotifications()
  }

  // Restore scroll position
  setTimeout(() => {
    if (sidebarNav.value) {
      sidebarNav.value.scrollTop = savedScroll.value || 0
      
      // Update scroll on scroll event to keep track
      sidebarNav.value.addEventListener('scroll', () => {
        savedScroll.value = sidebarNav.value?.scrollTop || 0
      })
    }
  }, 100)
})

const mainNav = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" }
]

const roleSections = [
  {
    title: "Menejment",
    items: [
      { name: "Kurslar", path: "/dashboard/courses", icon: "📚" },
      { name: "Guruhlar", path: "/dashboard/groups", icon: "👥" },
      { name: "O'quvchilar", path: "/dashboard/students", icon: "🎓" },
      { name: "O'qituvchilar", path: "/dashboard/teachers", icon: "👨‍🏫" },
      { name: "Lidlar (Leads)", path: "/dashboard/leads", icon: "🎯" }
    ]
  },
  {
    title: "CMS (Saytni Boshqarish)",
    items: [
      { name: "Blog / Yangiliklar", path: "/dashboard/blog", icon: "📰" },
      { name: "Natijalar (Sertifikat)", path: "/dashboard/achievements", icon: "🏆" },
      { name: "Oyni Yaxshilari", path: "/dashboard/student-of-month", icon: "⭐" },
      { name: "Hamkorlarimiz", path: "/dashboard/partners", icon: "🤝" },
      { name: "Mijoz Xabarlari", path: "/dashboard/messages", icon: "✉" },
      { name: "Aloqa Ma'lumotlari", path: "/dashboard/settings/contact", icon: "📞", roles: ['SUPER_ADMIN'] }
    ]
  },
  {
    title: "O'qituvchilar",
    items: [
      { name: "Dars Jadvali", path: "/dashboard/schedule", icon: "📅" },
      // { name: "Davomat", path: "/dashboard/attendance", icon: "📝" }
    ]
  },
  {
    title: "Moliya va Hisobotlar",
    roles: ['SUPER_ADMIN', 'FINANCE_ADMIN'],
    items: [
      { name: "Dashboard",         path: "/dashboard/finance",                icon: "📊" },
      { name: "To'lov qabul",      path: "/dashboard/finance/payments",        icon: "💳" },
      { name: "To'laganlar",       path: "/dashboard/finance/paid",            icon: "✅" },
      { name: "Qarzdorlar",        path: "/dashboard/finance/debtors",         icon: "❌" },
      { name: "Guruh bo'yicha",    path: "/dashboard/finance/debtors-by-group", icon: "📂" },
      { name: "O'qituvchilar",     path: "/dashboard/finance/teachers",        icon: "👨‍🏫" },
      { name: "Chiqimlar",         path: "/dashboard/finance/expenses",        icon: "💸" },
      { name: "Chegirmalar",       path: "/dashboard/finance/discounts",       icon: "🎁" },
      { name: "Hisobotlar",        path: "/dashboard/finance/reports",         icon: "📈" },
      { name: "Sozlamalar",        path: "/dashboard/finance/settings",        icon: "⚙️", roles: ['SUPER_ADMIN'] }
    ]
  }
]

const filteredMainNav = computed(() => {
  if (userRole.value === 'TEACHER') {
    return [
      { name: "Dashboard", path: "/dashboard/teacher", icon: "📊" }
    ]
  }
  return mainNav
})

const filteredRoleSections = computed(() => {
  if (userRole.value === 'TEACHER') {
    return [
      {
        title: "O'qituvchi Paneli",
        items: [
          { name: "Mening Guruhlarim",    path: "/dashboard/teacher",              icon: "👥" },
          { name: "Maosh va To'lovlar",   path: "/dashboard/teacher/salary",       icon: "💰" },
          { name: "Ota-onalar bilan aloqa", path: "/dashboard/teacher/messages",   icon: "✉️" },
          { name: "Qarzdorlar",           path: "/dashboard/finance/debtors",      icon: "❌" },
          { name: "Guruh bo'yicha",       path: "/dashboard/finance/debtors-by-group", icon: "📂" }
        ]
      }
    ]
  }
  if (userRole.value === 'FINANCE_ADMIN') {
    return roleSections
      .filter(s => s.roles?.includes('FINANCE_ADMIN'))
      .map(s => ({
        ...s,
        items: s.items.filter((item: any) => !item.roles || item.roles.includes('FINANCE_ADMIN'))
      }))
  }
  return roleSections.map(s => ({
    ...s,
    items: s.items.filter((item: any) => !item.roles || item.roles.includes(userRole.value))
  }))
})

// Logout: cookie-dan tokenni o'chirib, login sahifasiga yo'naltirish
const logout = () => {
  const token = useCookie("auth_token")
  const role = useCookie("auth_role")
  const name = useCookie("auth_name")
  const email = useCookie("auth_email")
  const id = useCookie("auth_id")

  token.value = null
  role.value = null
  name.value = null
  email.value = null
  id.value = null

  router.push("/login")
}
</script>

<style>
/* Active navigation link styling */
.router-link-active {
  background-color: #0f172a !important;
  color: #ffffff !important;
  border-left: 3px solid #6366f1;
  padding-left: 0.625rem;
}
</style>
