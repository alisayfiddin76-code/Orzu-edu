<template>
  <div class="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-brand-primary/10 relative overflow-hidden animate-slide-up">
    <!-- Decorative Gradient -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-brand-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

    <div class="text-center mb-8 relative z-10">
      <h2 class="text-2xl font-black text-brand-primary mb-2">Kabinetga Kirish</h2>
      <p class="text-sm font-medium text-slate-500">
        {{ loginMode === 'STUDENT' ? 'Telefon raqamingiz va parolingiz orqali tizimga kiring.' : 'Telefon raqamingizni kiriting va farzandingiz malumotlarini koring.' }}
      </p>
    </div>

    <!-- Mode Switcher -->
    <div class="flex items-center bg-slate-100 p-1 rounded-xl mb-6 relative z-10">
      <button 
        type="button"
        @click="loginMode = 'STUDENT'"
        class="flex-1 text-xs font-bold py-2.5 rounded-lg transition-all duration-200"
        :class="loginMode === 'STUDENT' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >
        O'quvchi
      </button>
      <button 
        type="button"
        @click="loginMode = 'PARENT'"
        class="flex-1 text-xs font-bold py-2.5 rounded-lg transition-all duration-200"
        :class="loginMode === 'PARENT' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >
        Ota-ona
      </button>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
      <!-- Error Message -->
      <div v-if="error" class="p-4 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger font-bold text-sm flex items-center gap-2">
        <span>⚠️</span> {{ error }}
      </div>

      <!-- Phone Number -->
      <div>
        <label class="block text-[10px] font-black text-brand-primary uppercase tracking-wider mb-2">
          Telefon raqami (Login) *
        </label>
        <div class="flex items-stretch shadow-sm rounded-xl">
          <span class="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-brand-border rounded-l-xl text-sm text-brand-primary font-bold whitespace-nowrap">
            +998
          </span>
          <input
            v-model="phoneInput"
            type="tel"
            placeholder="90 123 45 67"
            required
            maxlength="12"
            @input="formatPhoneInput"
            class="w-full bg-slate-50 border border-brand-border rounded-r-xl px-4 py-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
          />
        </div>
        <p class="text-[10px] font-semibold text-slate-500 mt-2 uppercase tracking-wide">Masalan: 90 123 45 67 (9 ta raqam)</p>
      </div>

      <!-- Password / Birthdate Input -->
      <div v-if="loginMode === 'STUDENT'">
        <label class="block text-[10px] font-black text-brand-primary uppercase tracking-wider mb-2">
          Parol yoki Tug'ilgan kun *
        </label>
        <input
          v-model="passwordInput"
          type="password"
          placeholder="Parolingiz"
          required
          class="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium shadow-sm"
        />
        <p class="text-[10px] font-semibold text-slate-500 mt-2 uppercase tracking-wide leading-relaxed">
          Boshlang'ich parol sifatida tug'ilgan sana ishlatiladi (Masalan: 20050815).
        </p>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading || !isFormValid"
        class="w-full bg-brand-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-xl shadow-brand-primary/20 hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-3 text-sm mt-2"
      >
        <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        {{ loading ? "Kirilmoqda..." : "Kabinetga Kirish" }}
      </button>

      <!-- Credentials preview -->
      <div v-if="isFormValid" class="text-center text-[11px] font-bold text-slate-500 border-t border-brand-border/60 pt-4 mt-2">
        <p>
          <span class="text-brand-primary">Login:</span> +998{{ rawPhone || '...' }}
          <template v-if="loginMode === 'STUDENT'">
            <span class="mx-2 text-slate-300">•</span>
            <span class="text-brand-primary">Kiritilgan parol:</span> ******
          </template>
        </p>
      </div>

      <!-- Prompt registration -->
      <div class="text-center pt-5 border-t border-brand-border/60 text-sm font-medium text-slate-500">
        Hisobingiz yo'qmi?
        <NuxtLink to="/register" class="text-brand-primary hover:text-brand-accent font-black transition-colors ml-1">Ro'yxatdan o'ting</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

definePageMeta({
  layout: 'auth'
});

useHead({
  title: "Kabinetga Kirish — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU shaxsiy kabinetiga telefon raqami va parol orqali kirish." }
  ]
});

const authStore = useAuthStore();

// ---- State ----
const loginMode = ref<'STUDENT' | 'PARENT'>('STUDENT');
const phoneInput = ref('');      // Formatlangan ko'rinish (ekranda)
const rawPhone = ref('');        // Faqat raqamlar (9 ta)
const passwordInput = ref('');   // Parol yoki Tug'ilgan kun (YYYYMMDD)
const loading = ref(false);
const error = ref('');

// ---- Phone formatting ----
// XX XXX XX XX = 9 raqam + 3 bo'shliq = 12 belgi
const formatPhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Faqat raqamlarni olib, 9 taga cheklaymiz
  let digits = input.value.replace(/\D/g, '').slice(0, 9);
  rawPhone.value = digits;

  // Raqamlarni to'g'ri bo'g'inlarga ajratamiz: XX XXX XX XX
  let formatted = digits;
  if (digits.length > 2) {
    formatted = digits.slice(0, 2) + ' ' + digits.slice(2);
  }
  if (digits.length > 5) {
    formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  }
  if (digits.length > 7) {
    formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 7) + ' ' + digits.slice(7);
  }

  phoneInput.value = formatted;
  input.value = formatted;
};


// ---- Validation ----
const isFormValid = computed(() => {
  if (loginMode.value === 'STUDENT') {
    return rawPhone.value.length === 9 && passwordInput.value.trim().length >= 4;
  } else {
    return rawPhone.value.length === 9;
  }
});

// ---- Login ----
const handleLogin = async () => {
  if (!isFormValid.value) {
    error.value = "Iltimos, barcha maydonlarni to'ldiring";
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Telefon: +998XXXXXXXXX formatida
    const phone = `+998${rawPhone.value}`;

    let success;
    if (loginMode.value === 'PARENT') {
      success = await authStore.parentLogin(phone);
    } else {
      // Parol (tug'ilgan kun yoki yangilangan parol)
      const password = passwordInput.value.trim();
      success = await authStore.login(phone, password);
    }

    if (success) {
      // success = redirectTo path ('/dashboard' yoki '/parent/dashboard')
      navigateTo(success);
    }
  } catch (err: any) {
    error.value = err?.data?.message || "Telefon yoki parol noto'g'ri. Qayta tekshiring.";
  } finally {
    loading.value = false;
  }
};
</script>
