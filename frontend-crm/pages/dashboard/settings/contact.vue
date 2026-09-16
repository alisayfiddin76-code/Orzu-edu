<template>
  <div class="min-h-screen bg-[#070F1A] text-white p-6 md:p-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-3">
          <span class="bg-[#F2C230]/10 border border-[#F2C230]/30 p-2.5 rounded-xl">
            <Icon name="lucide:settings" class="w-6 h-6 text-[#F2C230]" />
          </span>
          Aloqa Ma'lumotlari
        </h1>
        <p class="text-slate-400 text-sm mt-1.5">Saytdagi barcha aloqa ma'lumotlari shu yerdan boshqariladi</p>
      </div>
      <div class="flex gap-3">
        <button v-if="!editing" @click="startEdit"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#F2C230] hover:bg-[#D9A404] text-[#082F49] font-bold rounded-xl transition-all shadow-lg shadow-[#F2C230]/20">
          <Icon name="lucide:edit-3" class="w-4 h-4" /> Tahrirlash
        </button>
        <template v-else>
          <button @click="cancelEdit"
            class="flex items-center gap-2 px-5 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all">
            <Icon name="lucide:x" class="w-4 h-4" /> Bekor
          </button>
          <button @click="saveSettings" :disabled="saving"
            class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20">
            <Icon :name="saving ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', saving && 'animate-spin']" />
            {{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
        </template>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-[#F2C230] animate-spin" />
    </div>

    <!-- Success Alert -->
    <div v-if="successMsg" class="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-3">
      <Icon name="lucide:check-circle" class="w-5 h-5 shrink-0" /> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center gap-3">
      <Icon name="lucide:alert-circle" class="w-5 h-5 shrink-0" /> {{ errorMsg }}
    </div>

    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- TELEFON RAQAMLARI -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-indigo-500/10 p-2 rounded-lg"><Icon name="lucide:phone" class="w-5 h-5 text-indigo-400" /></span>
          <h2 class="font-bold text-white text-lg">Telefon Raqamlar</h2>
        </div>

        <!-- View Mode -->
        <template v-if="!editing">
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Icon name="lucide:phone-call" class="w-4 h-4 text-[#F2C230] shrink-0" />
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asosiy raqam</p>
                <p class="text-white font-semibold mt-0.5">{{ settings.phone_1 || '—' }}</p>
              </div>
            </div>
            <div v-if="settings.phone_2" class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Icon name="lucide:phone" class="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qo'shimcha raqam</p>
                <p class="text-white font-semibold mt-0.5">{{ settings.phone_2 }}</p>
              </div>
            </div>
            <div v-else class="text-sm text-slate-500 px-1 italic">Qo'shimcha raqam kiritilmagan</div>
          </div>
        </template>

        <!-- Edit Mode -->
        <template v-else>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asosiy raqam *</label>
              <input v-model="form.phone_1" type="text" placeholder="+998 90 123 45 67"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Qo'shimcha raqam</label>
              <input v-model="form.phone_2" type="text" placeholder="+998 71 456 78 90 (ixtiyoriy)"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
            </div>
          </div>
        </template>
      </div>

      <!-- EMAIL -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-[#F2C230]/10 p-2 rounded-lg"><Icon name="lucide:mail" class="w-5 h-5 text-[#F2C230]" /></span>
          <h2 class="font-bold text-white text-lg">Email Manzil</h2>
        </div>

        <template v-if="!editing">
          <div v-if="settings.email" class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <Icon name="lucide:at-sign" class="w-4 h-4 text-[#F2C230] shrink-0" />
            <p class="text-white font-semibold">{{ settings.email }}</p>
          </div>
          <div v-else class="text-sm text-slate-500 italic">Email kiritilmagan</div>
        </template>
        <template v-else>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email manzil</label>
            <input v-model="form.email" type="email" placeholder="info@orzuedu.uz (ixtiyoriy)"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
          </div>
        </template>
      </div>

      <!-- IJTIMOIY TARMOQLAR -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-sky-500/10 p-2 rounded-lg"><Icon name="lucide:share-2" class="w-5 h-5 text-sky-400" /></span>
          <h2 class="font-bold text-white text-lg">Ijtimoiy Tarmoqlar</h2>
        </div>

        <template v-if="!editing">
          <div class="space-y-3">
            <div v-if="settings.instagram" class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Icon name="lucide:instagram" class="w-4 h-4 text-pink-400 shrink-0" />
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instagram</p>
                <a :href="settings.instagram" target="_blank" class="text-pink-400 font-semibold hover:underline mt-0.5 block text-sm truncate">{{ settings.instagram }}</a>
              </div>
            </div>
            <div v-if="settings.telegram" class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Icon name="lucide:send" class="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telegram</p>
                <a :href="settings.telegram" target="_blank" class="text-sky-400 font-semibold hover:underline mt-0.5 block text-sm truncate">{{ settings.telegram }}</a>
              </div>
            </div>
            <div v-if="settings.youtube" class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Icon name="lucide:youtube" class="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">YouTube</p>
                <a :href="settings.youtube" target="_blank" class="text-red-500 font-semibold hover:underline mt-0.5 block text-sm truncate">{{ settings.youtube }}</a>
              </div>
            </div>
            <div v-if="!settings.instagram && !settings.telegram && !settings.youtube" class="text-sm text-slate-500 italic">Ijtimoiy tarmoqlar kiritilmagan</div>
          </div>
        </template>
        <template v-else>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Instagram havola</label>
              <input v-model="form.instagram" type="text" placeholder="https://instagram.com/orzuedu (ixtiyoriy)"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Telegram havola / kanal</label>
              <input v-model="form.telegram" type="text" placeholder="https://t.me/orzuedu (ixtiyoriy)"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">YouTube havola</label>
              <input v-model="form.youtube" type="text" placeholder="https://youtube.com/... (ixtiyoriy)"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
            </div>
          </div>
        </template>
      </div>

      <!-- MANZILLAR -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-emerald-500/10 p-2 rounded-lg"><Icon name="lucide:map-pin" class="w-5 h-5 text-emerald-400" /></span>
          <h2 class="font-bold text-white text-lg">Manzillar</h2>
        </div>

        <template v-if="!editing">
          <div class="space-y-3">
            <div class="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Icon name="lucide:building-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asosiy ofis</p>
                <p class="text-white font-semibold mt-0.5 text-sm leading-relaxed">{{ settings.main_address || '—' }}</p>
              </div>
            </div>
            
            <template v-if="settings.branches && settings.branches.length > 0">
              <div v-for="(branch, idx) in settings.branches" :key="idx" class="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filial {{ idx + 1 }}</p>
                  <p class="text-white font-semibold mt-0.5 text-sm leading-relaxed">{{ branch }}</p>
                </div>
              </div>
            </template>
            <div v-else class="text-sm text-slate-500 italic">Filiallar kiritilmagan</div>
          </div>
        </template>
        <template v-else>
          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asosiy manzil *</label>
              <textarea v-model="form.main_address" rows="2" placeholder="Toshkent sh., Chilonzor tumani..."
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition resize-none"></textarea>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qo'shimcha Filiallar</label>
                <button type="button" @click="form.branches.push('')" class="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  <Icon name="lucide:plus" class="w-3 h-3" /> Qo'shish
                </button>
              </div>
              
              <div class="space-y-3">
                <div v-for="(branch, idx) in form.branches" :key="idx" class="flex gap-2 items-start">
                  <textarea v-model="form.branches[idx]" rows="2" :placeholder="`Filial ${idx + 1} manzili...`"
                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition resize-none"></textarea>
                  <button type="button" @click="form.branches.splice(idx, 1)" class="p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30" title="O'chirish">
                    <Icon name="lucide:trash-2" class="w-5 h-5" />
                  </button>
                </div>
                <div v-if="!form.branches || form.branches.length === 0" class="text-xs text-slate-500 italic p-3 border border-dashed border-slate-700 rounded-xl text-center">
                  Filiallar yo'q. Yangi filial qo'shish uchun "Qo'shish" tugmasini bosing.
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ISH VAQTLARI -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 lg:col-span-2">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-amber-500/10 p-2 rounded-lg"><Icon name="lucide:clock" class="w-5 h-5 text-amber-400" /></span>
          <h2 class="font-bold text-white text-lg">Ish Vaqtlari</h2>
        </div>

        <template v-if="!editing">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <span class="font-semibold text-slate-300 text-sm">{{ settings.weekdays_label || 'Dushanba - Shanba' }}</span>
              <span class="font-black text-[#F2C230] bg-[#F2C230]/10 border border-[#F2C230]/20 px-3 py-1 rounded-lg text-sm">{{ settings.weekdays_hours || '09:00 - 20:00' }}</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <span class="font-semibold text-slate-400 text-sm">{{ settings.weekend_label || 'Yakshanba' }}</span>
              <span class="font-bold text-rose-400 text-sm">{{ settings.weekend_hours || 'Dam olish kuni' }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-3">
              <p class="text-xs font-bold text-amber-400 uppercase tracking-wider">Ish kunlari</p>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kunlar nomi</label>
                <input v-model="form.weekdays_label" type="text" placeholder="Dushanba - Shanba"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ish vaqti</label>
                <input v-model="form.weekdays_hours" type="text" placeholder="09:00 - 20:00"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
              </div>
            </div>
            <div class="space-y-3">
              <p class="text-xs font-bold text-rose-400 uppercase tracking-wider">Dam olish kuni</p>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kun nomi</label>
                <input v-model="form.weekend_label" type="text" placeholder="Yakshanba"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Holati</label>
                <input v-model="form.weekend_hours" type="text" placeholder="Dam olish kuni"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C230]/40 focus:border-[#F2C230]/50 transition" />
              </div>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Preview Badge -->
    <div class="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 text-sm flex items-center gap-2">
      <Icon name="lucide:info" class="w-4 h-4 shrink-0" />
      Saqlangan ma'lumotlar darhol public saytning "Aloqa" bo'limida avtomatik ko'rinadi.
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const API = ''
const token = useCookie('auth_token')

const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const settings = ref<any>({
  phone_1: '', phone_2: '', email: '',
  main_address: '', branch_address: '', branches: [],
  instagram: '', telegram: '', youtube: '',
  weekdays_label: 'Dushanba - Shanba',
  weekdays_hours: '09:00 - 20:00',
  weekend_label: 'Yakshanba',
  weekend_hours: 'Dam olish kuni',
})

const form = ref<any>({ branches: [] })

const fetchSettings = async () => {
  loading.value = true
  try {
    const res: any = await $fetch(`${API}/api/v1/settings/contact`)
    settings.value = res.data.settings
  } catch (err: any) {
    errorMsg.value = "Ma'lumotlarni yuklashda xatolik"
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  form.value = JSON.parse(JSON.stringify(settings.value))
  if (!form.value.branches) form.value.branches = []
  
  // Migrate old branch_address to branches array if it exists and branches is empty
  if (form.value.branch_address && form.value.branches.length === 0) {
    form.value.branches.push(form.value.branch_address)
    form.value.branch_address = null
  }
  
  editing.value = true
  successMsg.value = ''
  errorMsg.value = ''
}

const cancelEdit = () => {
  editing.value = false
  errorMsg.value = ''
}

const saveSettings = async () => {
  if (!form.value.phone_1 || !form.value.main_address) {
    errorMsg.value = "Asosiy telefon va manzil majburiy!"
    return
  }
  saving.value = true
  errorMsg.value = ''
  try {
    const res: any = await $fetch(`${API}/api/v1/settings/contact`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: form.value
    })
    settings.value = res.data.settings
    editing.value = false
    successMsg.value = "Aloqa ma'lumotlari muvaffaqiyatli saqlandi!"
    setTimeout(() => { successMsg.value = '' }, 4000)
  } catch (err: any) {
    errorMsg.value = err?.data?.message || "Saqlashda xatolik yuz berdi"
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>
