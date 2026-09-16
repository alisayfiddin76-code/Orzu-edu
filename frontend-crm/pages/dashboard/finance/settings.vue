<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-white">⚙️ Finance Sozlamalari</h1>
      <p class="text-sm text-slate-400 mt-1">Finance Admin boshqaruvi — faqat Super Admin uchun</p>
    </div>

    <!-- Current Finance Admin -->
    <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
      <h2 class="text-sm font-bold text-white">👤 Joriy Finance Admin</h2>

      <div v-if="loadingAdmin" class="text-slate-400 text-sm">Yuklanmoqda...</div>

      <div v-else-if="financeAdmin" class="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
            {{ financeAdmin.firstname?.[0] }}
          </div>
          <div>
            <p class="font-bold text-white">{{ financeAdmin.firstname }} {{ financeAdmin.lastname }}</p>
            <p class="text-xs text-slate-400">@{{ financeAdmin.username }} · <span class="text-emerald-400">FINANCE_ADMIN</span></p>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="showPasswordForm = !showPasswordForm" class="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-semibold transition-colors">
            🔑 Parol
          </button>
          <button @click="deleteAdmin" class="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold transition-colors">
            🗑 O'chirish
          </button>
        </div>
      </div>

      <!-- Change Password Form -->
      <div v-if="financeAdmin && showPasswordForm" class="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-3">
        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">Parolni O'zgartirish</h4>
        <input v-model="newPassword" type="password" placeholder="Yangi parol (kamida 6 belgi)" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500" />
        <div class="flex gap-3">
          <button @click="changePassword" :disabled="savingPassword" class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50 transition-colors">
            {{ savingPassword ? '...' : 'Saqlash' }}
          </button>
          <button @click="showPasswordForm = false" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor</button>
        </div>
        <div v-if="passwordMsg" class="text-xs" :class="passwordMsg.includes('✅') ? 'text-emerald-400' : 'text-rose-400'">{{ passwordMsg }}</div>
      </div>

      <!-- No admin — Create Form -->
      <div v-else-if="!financeAdmin" class="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
        <p class="text-sm text-slate-400">Finance Admin hali yaratilmagan. Yangi admin qo'shing:</p>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Ism *</label>
            <input v-model="createForm.firstname" type="text" placeholder="Ism" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Familiya *</label>
            <input v-model="createForm.lastname" type="text" placeholder="Familiya" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Username * <span class="text-slate-600">(telefon emas)</span></label>
            <input v-model="createForm.username" type="text" placeholder="masalan: finance_admin" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Parol *</label>
            <input v-model="createForm.password" type="password" placeholder="Kamida 6 belgi" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div v-if="createError" class="text-rose-400 text-xs">{{ createError }}</div>
        <button @click="createAdmin" :disabled="creating" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-colors">
          {{ creating ? 'Yaratilmoqda...' : '+ Finance Admin Yaratish' }}
        </button>
      </div>
    </div>

    <!-- Manual Invoice Generator -->
    <div class="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
      <h2 class="text-sm font-bold text-white">🗓 Qo'lda Invoice Yaratish</h2>
      <p class="text-xs text-slate-500">Joriy oy uchun barcha faol guruh o'quvchilariga invoice yaratadi (har oyning 1-kuni avtomatik bajariladi).</p>
      <button @click="generateInvoices" :disabled="generating" class="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold disabled:opacity-50 transition-colors">
        {{ generating ? 'Yaratilmoqda...' : '⚡ Hozir Invoice Yaratish' }}
      </button>
      <div v-if="generateMsg" class="text-xs" :class="generateMsg.includes('✅') ? 'text-emerald-400' : 'text-rose-400'">{{ generateMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
definePageMeta({ layout: 'admin' })
useHead({ title: 'Finance Sozlamalari — ORZU EDU' })

const financeAdmin = ref<any>(null)
const loadingAdmin = ref(true)
const showPasswordForm = ref(false)
const newPassword = ref('')
const savingPassword = ref(false)
const passwordMsg = ref('')
const creating = ref(false)
const createError = ref('')
const generating = ref(false)
const generateMsg = ref('')

const createForm = reactive({ firstname: '', lastname: '', username: '', password: '' })

const fetchAdmin = async () => {
  loadingAdmin.value = true
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>('/api/v1/finance/admin', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    financeAdmin.value = res.data?.financeAdmin || null
  } catch {
    financeAdmin.value = null
  } finally {
    loadingAdmin.value = false
  }
}

const createAdmin = async () => {
  if (!createForm.firstname || !createForm.lastname || !createForm.username || !createForm.password) {
    createError.value = 'Barcha maydonlar majburiy'; return
  }
  creating.value = true; createError.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch('/api/v1/finance/admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { ...createForm }
    })
    await fetchAdmin()
  } catch (e: any) {
    createError.value = e?.data?.message || 'Yaratishda xatolik'
  } finally {
    creating.value = false
  }
}

const changePassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    passwordMsg.value = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'; return
  }
  savingPassword.value = true; passwordMsg.value = ''
  try {
    const token = useCookie('auth_token')
    await $fetch(`/api/v1/finance/admin/${financeAdmin.value._id}/password`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { newPassword: newPassword.value }
    })
    passwordMsg.value = "✅ Parol muvaffaqiyatli o'zgartirildi"
    newPassword.value = ''
    setTimeout(() => { showPasswordForm.value = false; passwordMsg.value = '' }, 2000)
  } catch (e: any) {
    passwordMsg.value = e?.data?.message || 'Xatolik yuz berdi'
  } finally {
    savingPassword.value = false
  }
}

const deleteAdmin = async () => {
  if (!confirm("Finance Adminni o'chirishni tasdiqlaysizmi?")) return
  try {
    const token = useCookie('auth_token')
    await $fetch(`/api/v1/finance/admin/${financeAdmin.value._id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` }
    })
    financeAdmin.value = null
  } catch (e: any) {
    alert(e?.data?.message || "O'chirishda xatolik")
  }
}

const generateInvoices = async () => {
  if (!confirm('Joriy oy uchun invoicelar yaratilsinmi?')) return
  generating.value = true; generateMsg.value = ''
  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>('/api/v1/finance/invoices/generate', {
      method: 'POST', headers: { Authorization: `Bearer ${token.value}` }
    })
    generateMsg.value = `✅ ${res.data?.created || 0} ta invoice yaratildi`
  } catch (e: any) {
    generateMsg.value = e?.data?.message || 'Xatolik yuz berdi'
  } finally {
    generating.value = false
  }
}

onMounted(fetchAdmin)
</script>
