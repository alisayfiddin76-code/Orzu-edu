<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">

    <!-- Ambient background gradients -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-5%] w-[28rem] h-[28rem] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[24rem] h-[24rem] bg-violet-600/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md">

      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-600/20">
            O
          </div>
          <div>
            <p class="text-2xl font-extrabold tracking-tight text-white">ORZU CRM</p>
            <p class="text-[10px] tracking-widest uppercase text-slate-500 font-semibold">Boshqaruv Tizimi</p>
          </div>
        </div>
      </div>

      <!-- Card -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
        <h2 class="text-xl font-bold text-white mb-1">Xush kelibsiz!</h2>
        <p class="text-sm text-slate-400 mb-7">Davom etish uchun hisobingizga kiring.</p>

        <!-- Error Alert -->
        <div
          v-if="errorMsg"
          class="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Login type toggle -->
          <div class="flex rounded-xl overflow-hidden border border-slate-700 mb-2">
            <button
              type="button"
              @click="loginMode = 'phone'"
              :class="['flex-1 py-2 text-xs font-bold transition-colors', loginMode === 'phone' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white']"
            >
              📞 Telefon
            </button>
            <button
              type="button"
              @click="loginMode = 'username'"
              :class="['flex-1 py-2 text-xs font-bold transition-colors', loginMode === 'username' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white']"
            >
              👤 Username
            </button>
          </div>

          <!-- Phone Input -->
          <div v-if="loginMode === 'phone'">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Telefon raqami
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              autocomplete="tel"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200"
            />
          </div>

          <!-- Username Input -->
          <div v-else>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username (Finance Admin)
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="finance_admin"
              autocomplete="username"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Parol
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-lg"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "🙈" : "👁" }}
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            id="login-submit"
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ loading ? "Kirilmoqda..." : "Kirish" }}</span>
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-slate-600 mt-6">
        ORZU EDU &copy; {{ new Date().getFullYear() }} — Faqat xodimlar uchun
      </p>
      <p class="text-center text-xs text-slate-600 mt-2">
        O'quvchimisiz?
        <NuxtLink to="/student/login" class="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
          Talaba kabinetiga kiring →
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const router = useRouter()

const form = reactive({ phone: "+998", username: "", password: "" })
const loginMode = ref<'phone' | 'username'>('phone')
const loading = ref(false)
const errorMsg = ref("")
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ""

  // Build login payload
  let loginBody: any = { password: form.password, app_type: 'CRM' }

  if (loginMode.value === 'username') {
    if (!form.username.trim()) { errorMsg.value = 'Username kiriting'; loading.value = false; return }
    loginBody.username = form.username.trim()
  } else {
    // Format phone number to ensure correct +998XXXXXXXXX format
    let phoneInput = form.phone.trim().replace(/[\s\-\(\)]/g, '')
    if (!phoneInput.startsWith('+998')) {
      phoneInput = phoneInput.startsWith('998') ? '+' + phoneInput : '+998' + phoneInput
    }
    loginBody.phone = phoneInput
  }

  try {
    const data: any = await $fetch("/api/v1/auth/login", {
      baseURL: 'https://orzu-edu.onrender.com',
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: loginBody
    })

      if (data?.token) {
      // Save token to cookie (expires in 7 days)
      const token = useCookie("auth_token", {
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      })
      token.value = data.token

      // Save role, name, and email to cookies
      const roleCookie = useCookie("auth_role", { maxAge: 60 * 60 * 24 * 7, path: "/" })
      roleCookie.value = data.data?.user?.role

      const nameCookie = useCookie("auth_name", { maxAge: 60 * 60 * 24 * 7, path: "/" })
      nameCookie.value = `${data.data?.user?.firstname} ${data.data?.user?.lastname}`

      const emailCookie = useCookie("auth_email", { maxAge: 60 * 60 * 24 * 7, path: "/" })
      emailCookie.value = data.data?.user?.email || ""

      const idCookie = useCookie("auth_id", { maxAge: 60 * 60 * 24 * 7, path: "/" })
      idCookie.value = data.data?.user?._id || ""

      // Route based on user role
      const userRole = data.data?.user?.role
      if (userRole === 'STUDENT') {
        await router.push("/student/dashboard")
      } else if (userRole === 'TEACHER') {
        await router.push("/dashboard/teacher")
      } else if (userRole === 'FINANCE_ADMIN') {
        await router.push("/dashboard/finance")
      } else {
        await router.push("/dashboard")
      }
    } else {
      errorMsg.value = "Noma'lum xatolik yuz berdi. Qayta urinib ko'ring."
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || "Server bilan bog'lanib bo'lmadi."
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}
</script>
