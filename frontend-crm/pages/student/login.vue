<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style="background: #061220;">

    <!-- Ambient blobs -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-8%] left-[-5%] w-96 h-96 rounded-full blur-[120px]" style="background: rgba(8,47,73,0.7);"></div>
      <div class="absolute bottom-[-8%] right-[-5%] w-80 h-80 rounded-full blur-[100px]" style="background: rgba(242,194,48,0.08);"></div>
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-md">

      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl" style="background: linear-gradient(135deg, #082F49, #0C3E63); border: 2px solid rgba(242,194,48,0.3);">
            <span class="text-2xl font-black" style="color: #F2C230;">O</span>
          </div>
          <div>
            <p class="text-2xl font-extrabold tracking-tight text-white">ORZU EDU</p>
            <p class="text-[10px] tracking-widest uppercase font-semibold" style="color: #F2C230;">Talaba Kabineti</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="rounded-2xl p-8 shadow-2xl backdrop-blur-sm" style="background: rgba(8,47,73,0.5); border: 1px solid rgba(242,194,48,0.15);">
        <h2 class="text-xl font-bold text-white mb-1">Xush kelibsiz! 👋</h2>
        <p class="text-sm mb-7" style="color: #486581;">Talaba kabinetiga kirish uchun ma'lumotlaringizni kiriting.</p>

        <!-- Error -->
        <div
          v-if="errorMsg"
          class="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
          style="background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25); color: #f87171;"
        >
          {{ errorMsg }}
        </div>

        <!-- Success -->
        <div
          v-if="successMsg"
          class="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
          style="background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.25); color: #4ade80;"
        >
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">

          <!-- Phone -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #486581;">
              📞 Telefon raqami
            </label>
            <input
              id="student-phone"
              v-model="form.phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              autocomplete="tel"
              class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
              style="background: rgba(6,38,59,0.8); border: 1px solid rgba(242,194,48,0.2); outline: none;"
            />
          </div>

          <!-- Birthdate as password -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #486581;">
              🔑 Parol (Tug'ilgan kun)
            </label>
            <div class="relative">
              <input
                id="student-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masalan: 20051230"
                autocomplete="current-password"
                required
                class="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                style="background: rgba(6,38,59,0.8); border: 1px solid rgba(242,194,48,0.2); outline: none;"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-colors"
                style="color: #486581;"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <p class="text-[11px] mt-1.5" style="color: #486581;">
              Format: <span class="font-bold" style="color: #F2C230;">YYYY</span>MM<span class="font-bold" style="color: #F2C230;">DD</span>
              &nbsp;|&nbsp; Masalan: <span style="color: #F2C230;">20051230</span>
            </p>
          </div>

          <!-- Submit -->
          <button
            id="student-login-submit"
            type="submit"
            :disabled="loading"
            class="w-full font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            style="background: linear-gradient(135deg, #0C3E63, #082F49); border: 1px solid rgba(242,194,48,0.5); color: #F2C230; box-shadow: 0 4px 20px rgba(242,194,48,0.1);"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></span>
            <span>{{ loading ? 'Kirilmoqda...' : '🚀 Kabinetga Kirish' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6 pt-5" style="border-top: 1px solid rgba(242,194,48,0.1);">
          <p class="text-center text-xs" style="color: #486581;">
            Admin yoki o'qituvchimisiz?
            <NuxtLink to="/login" class="font-semibold transition-colors" style="color: #F2C230;">
              CRM ga kiring →
            </NuxtLink>
          </p>
        </div>
      </div>

      <p class="text-center text-xs mt-6" style="color: rgba(72,101,129,0.4);">
        © {{ new Date().getFullYear() }} ORZU EDU. Barcha huquqlar himoyalangan.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const router = useRouter()

const form = reactive({ phone: '+998', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  // Format phone to +998XXXXXXXXX
  let phone = form.phone.trim().replace(/[\s\-\(\)]/g, '')
  if (!phone.startsWith('+998')) {
    phone = phone.startsWith('998') ? '+' + phone : '+998' + phone
  }

  // Remove dashes in case user entered YYYY-MM-DD format
  const password = form.password.trim().replace(/-/g, '')

  if (!phone || phone.length < 12) {
    errorMsg.value = "To'g'ri telefon raqamini kiriting (+998XXXXXXXXX)"
    loading.value = false
    return
  }
  if (!password) {
    errorMsg.value = "Parolni (tug'ilgan kun YYYYMMDD) kiriting"
    loading.value = false
    return
  }

  try {
    const data: any = await $fetch('/api/v1/auth/login', {
      method: 'POST',
      body: {
        phone,
        password,
        app_type: 'PUBLIC'  // ← allows STUDENT and PARENT roles
      }
    })

    if (data?.token) {
      // Store auth cookies
      const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7, path: '/' })
      tokenCookie.value = data.token

      const roleCookie = useCookie('auth_role', { maxAge: 60 * 60 * 24 * 7, path: '/' })
      roleCookie.value = data.data?.user?.role || 'STUDENT'

      const nameCookie = useCookie('auth_name', { maxAge: 60 * 60 * 24 * 7, path: '/' })
      nameCookie.value = `${data.data?.user?.firstname || ''} ${data.data?.user?.lastname || ''}`.trim()

      successMsg.value = "Muvaffaqiyatli kirdingiz! Kabinetga o'tkazilmoqda..."

      const role = data.data?.user?.role
      if (role === 'PARENT') {
        await router.push('/parent/dashboard')
      } else {
        await router.push('/student/dashboard')
      }
    } else {
      errorMsg.value = "Noma'lum xatolik. Qayta urinib ko'ring."
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || "Server bilan bog'lanib bo'lmadi."
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}
</script>
