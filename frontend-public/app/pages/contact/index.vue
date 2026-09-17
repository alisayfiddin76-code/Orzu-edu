<template>
  <div class="py-20 max-w-6xl mx-auto px-6 bg-brand-background min-h-screen">
    <div class="text-center mb-16 animate-slide-up">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-accent/20 border border-brand-accent text-brand-primary mb-6 shadow-sm">
        ✉ Aloqa va Bog'lanish
      </span>
      <h1 class="text-4xl sm:text-5xl font-black text-brand-primary tracking-tight">Biz Bilan <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Bog'laning</span></h1>
      <p class="text-slate-600 mt-6 text-base max-w-2xl mx-auto leading-relaxed font-medium">
        Savollaringiz yoki takliflaringiz bormi? Quyidagi formani to'ldiring, tez fursatda javob beramiz.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <!-- Left: Contact Details -->
      <div class="lg:col-span-5 space-y-6 bg-white border border-brand-border rounded-3xl p-8 shadow-xl shadow-brand-primary/5 animate-slide-up" style="animation-delay: 0.1s">
        <div>
          <h3 class="text-2xl font-black text-brand-primary mb-8">Aloqa Ma'lumotlari</h3>

          <div v-if="loadingSettings" class="py-8 flex justify-center">
            <div class="w-8 h-8 border-3 border-brand-accent/40 border-t-brand-accent rounded-full animate-spin"></div>
          </div>

          <div v-else class="space-y-4 text-sm text-slate-600 font-medium">

            <!-- Phone 1 -->
            <div v-if="contactSettings.phone_1" class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-brand-border hover:border-brand-accent/50 transition-colors">
              <span class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl shadow-sm">📞</span>
              <div>
                <p class="font-bold text-brand-primary mb-1 uppercase tracking-wider text-[10px]">Telefon raqam:</p>
                <a :href="`tel:${contactSettings.phone_1}`" class="text-base font-bold hover:text-brand-accent transition-colors">{{ contactSettings.phone_1 }}</a>
              </div>
            </div>

            <!-- Phone 2 -->
            <div v-if="contactSettings.phone_2" class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-brand-border hover:border-brand-accent/50 transition-colors">
              <span class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl shadow-sm">📱</span>
              <div>
                <p class="font-bold text-brand-primary mb-1 uppercase tracking-wider text-[10px]">Qo'shimcha raqam:</p>
                <a :href="`tel:${contactSettings.phone_2}`" class="text-base font-bold hover:text-brand-accent transition-colors">{{ contactSettings.phone_2 }}</a>
              </div>
            </div>

            <!-- Email -->
            <div v-if="contactSettings.email" class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-brand-border hover:border-brand-accent/50 transition-colors">
              <span class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl shadow-sm">📧</span>
              <div>
                <p class="font-bold text-brand-primary mb-1 uppercase tracking-wider text-[10px]">Email:</p>
                <a :href="`mailto:${contactSettings.email}`" class="text-base font-bold hover:text-brand-accent transition-colors">{{ contactSettings.email }}</a>
              </div>
            </div>

            <!-- Main Address -->
            <div v-if="contactSettings.main_address" class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-brand-border hover:border-brand-accent/50 transition-colors">
              <span class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl shadow-sm">🏢</span>
              <div>
                <p class="font-bold text-brand-primary mb-1 uppercase tracking-wider text-[10px]">{{ contactSettings.branch_address ? 'Asosiy ofis:' : 'Manzil:' }}</p>
                <p class="text-sm font-semibold leading-relaxed">{{ contactSettings.main_address }}</p>
              </div>
            </div>

            <!-- Branches (Dynamic) -->
            <template v-if="contactSettings.branches && contactSettings.branches.length > 0">
              <div v-for="(branch, idx) in contactSettings.branches" :key="idx" class="flex items-start gap-4 p-4 rounded-2xl bg-brand-accent/5 border border-brand-accent/30 hover:border-brand-accent/60 transition-colors">
                <span class="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-primary text-xl shadow-sm">📍</span>
                <div>
                  <p class="font-bold text-brand-primary mb-1 uppercase tracking-wider text-[10px]">Filial {{ idx + 1 }}:</p>
                  <p class="text-sm font-semibold leading-relaxed">{{ branch }}</p>
                </div>
              </div>
            </template>
            <!-- Fallback for old branch_address if branches array is empty -->
            <template v-else-if="contactSettings.branch_address">
              <div class="flex items-start gap-4 p-4 rounded-2xl bg-brand-accent/5 border border-brand-accent/30 hover:border-brand-accent/60 transition-colors">
                <span class="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-primary text-xl shadow-sm">📍</span>
                <div>
                  <p class="font-bold text-brand-primary mb-1 uppercase tracking-wider text-[10px]">Filial:</p>
                  <p class="text-sm font-semibold leading-relaxed">{{ contactSettings.branch_address }}</p>
                </div>
              </div>
            </template>

            <!-- Social Links -->
            <div v-if="contactSettings.instagram || contactSettings.telegram || contactSettings.youtube" class="flex gap-3 pt-2 flex-wrap">
              <a v-if="contactSettings.instagram" :href="contactSettings.instagram" target="_blank"
                class="flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 font-bold text-sm hover:bg-pink-100 transition-colors">
                <Icon name="fa6-brands:instagram" class="text-lg" /> Instagram
              </a>
              <a v-if="contactSettings.telegram" :href="contactSettings.telegram" target="_blank"
                class="flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 font-bold text-sm hover:bg-sky-100 transition-colors">
                <Icon name="fa6-brands:telegram" class="text-lg" /> Telegram
              </a>
              <a v-if="contactSettings.youtube" :href="contactSettings.youtube" target="_blank"
                class="flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors">
                <Icon name="fa6-brands:youtube" class="text-lg" /> YouTube
              </a>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-brand-border/60">
          <h4 class="text-xs font-black text-brand-primary mb-3 uppercase tracking-wider">Ish vaqti:</h4>
          <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-brand-border text-sm">
            <span class="font-bold text-slate-600">{{ contactSettings.weekdays_label || 'Dushanba - Shanba' }}</span>
            <span class="font-black text-brand-primary bg-brand-accent/20 px-2 py-1 rounded">{{ contactSettings.weekdays_hours || '09:00 - 20:00' }}</span>
          </div>
          <div class="flex justify-between items-center mt-2 px-4 text-xs font-semibold text-brand-danger">
            <span>{{ contactSettings.weekend_label || 'Yakshanba' }}</span>
            <span>{{ contactSettings.weekend_hours || 'Dam olish kuni' }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Contact Form -->
      <div class="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-brand-primary/10 animate-slide-up relative overflow-hidden" style="animation-delay: 0.2s">
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <!-- Success Alert -->
        <div v-if="success" class="text-center py-12 relative z-10">
          <div class="w-20 h-20 bg-brand-success/10 border border-brand-success/20 rounded-full flex items-center justify-center text-brand-success text-4xl mx-auto mb-6 shadow-sm">
            ✓
          </div>
          <h3 class="text-2xl font-black text-brand-primary mb-3">🎉 Rahmat! Xabaringiz yuborildi.</h3>
          <p class="text-base text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
            Tez orada menejerlarimiz siz bilan ko'rsatilgan telefon raqami orqali bog'lanishadi.
          </p>
          <button @click="resetForm" class="mt-8 px-6 py-3 rounded-full bg-brand-primary text-white font-bold text-sm hover:-translate-y-0.5 transition-all shadow-md">
            Yangi xabar yuborish
          </button>
        </div>

        <form v-else @submit.prevent="sendMessage" class="space-y-6 relative z-10">
          <h3 class="text-2xl font-black text-brand-primary mb-6">Xabar yozish</h3>
          
          <!-- Error message -->
          <div v-if="error" class="p-4 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-sm font-bold flex items-center gap-2">
            <span>⚠️</span> {{ error }}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-[10px] font-black text-brand-primary uppercase tracking-wider mb-2">Ismingiz *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Masalan: Dilshod"
                required
                class="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-[10px] font-black text-brand-primary uppercase tracking-wider mb-2">Telefon raqamingiz *</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                required
                class="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <!-- Subject -->
          <div>
            <label class="block text-[10px] font-black text-brand-primary uppercase tracking-wider mb-2">Mavzu</label>
            <input
              v-model="form.subject"
              type="text"
              placeholder="Masalan: Kurslar bo'yicha savol"
              class="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
            />
          </div>

          <!-- Message -->
          <div>
            <label class="block text-[10px] font-black text-brand-primary uppercase tracking-wider mb-2">Xabaringiz *</label>
            <textarea
              v-model="form.message"
              rows="5"
              placeholder="Xabaringizni bu yerga yozing..."
              required
              class="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none font-medium"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-brand-primary hover:bg-[#1A4B65] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-xl shadow-brand-primary/20 hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-3 text-sm mt-4"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ loading ? "Yuborilmoqda..." : "Xabarni Yuborish" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

useHead({
  title: "Aloqa — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quv markazi bilan bog'lanish, manzil, telefon va aloqa formasi." }
  ]
});

// Contact settings from API
const contactSettings = ref<any>({
  phone_1: '', phone_2: '', email: '',
  main_address: '', branch_address: '', branches: [],
  instagram: '', telegram: '', youtube: ''
})
const loadingSettings = ref(true)

const fetchContactSettings = async () => {
  try {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiUrl || 'https://orzu-edu.onrender.com';
    const res: any = await $fetch('/api/v1/settings/contact', { baseURL })
    if (res?.data?.settings) {
      contactSettings.value = res.data.settings
    }
  } catch (e) {
    // fallback values if API fails
    contactSettings.value = {
      phone_1: '+998 71 123 45 67',
      email: 'info@orzuedu.uz',
      main_address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi, 42-uy"
    }
  } finally {
    loadingSettings.value = false
  }
}

onMounted(fetchContactSettings)

const form = reactive({
  name: '',
  phone: '',
  subject: '',
  message: ''
});

const loading = ref(false);
const success = ref(false);
const error = ref('');

const sendMessage = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response: any = await $fetch('/api/v1/messages', {
      method: 'POST',
      body: form
    });
    if (response.status === 'success') {
      success.value = true;
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Xabarni yuborishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.name = '';
  form.phone = '';
  form.subject = '';
  form.message = '';
  success.value = false;
  error.value = '';
};
</script>
