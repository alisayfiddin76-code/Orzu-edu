<template>
  <div class="min-h-screen bg-[#F0F4F8] py-12 sm:py-20 px-4 sm:px-6 relative" id="registration-form">
    <!-- Background decor -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-primary/[0.03] rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-brand-accent/[0.04] rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-xl mx-auto relative z-10">
      <!-- Page Header -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary mb-5 border border-brand-primary/10">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
          Bepul sinov darsi
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-brand-primary tracking-tight leading-tight">
          Kursga Yozilish
        </h1>
        <p class="text-slate-500 mt-3 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          Ma'lumotlaringizni qoldiring — menejerimiz 30 daqiqa ichida siz bilan bog'lanadi.
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-xl shadow-brand-primary/[0.06] border border-slate-200/80 overflow-hidden animate-fade-in-up" style="animation-delay: 80ms;">

        <!-- Success Message -->
        <div v-if="submitSuccess" class="p-8 sm:p-12 text-center">
          <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/60">
            <svg class="w-10 h-10 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </div>
          <h3 class="text-2xl font-extrabold text-brand-primary mb-2">Arizangiz qabul qilindi!</h3>
          <p class="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Tez orada menejerimiz siz bilan bog'lanadi. O'quv markazimizni tanlaganingiz uchun rahmat!
          </p>
          <NuxtLink to="/" class="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 text-brand-primary font-semibold text-sm hover:bg-slate-200 transition-colors">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Bosh sahifaga qaytish
          </NuxtLink>
        </div>

        <!-- Main Form -->
        <form v-else @submit.prevent="submitLead">
          <!-- Error Banner -->
          <div v-if="submitError" class="mx-6 mt-6 p-3.5 rounded-xl bg-red-50 border border-red-200/60 flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
            <p class="text-sm font-semibold text-red-700">{{ submitError }}</p>
          </div>

          <!-- ═══════════ SECTION 1: O'quvchi ma'lumotlari ═══════════ -->
          <div class="px-6 sm:px-8 pt-7 pb-6">
            <h2 class="section-title">
              <span class="section-badge">1</span>
              O'quvchi ma'lumotlari
            </h2>
            <div class="space-y-5">
              <!-- Full Name -->
              <div>
                <label for="reg-fullname" class="form-label">Ism va Familiya <span class="text-red-400">*</span></label>
                <input id="reg-fullname" v-model="leadForm.fullname" type="text" placeholder="Masalan: Sherzod Umarov" required class="form-input" />
              </div>

              <!-- Student Phone -->
              <div>
                <label for="reg-phone" class="form-label">Telefon raqami (Login) <span class="text-red-400">*</span></label>
                <div class="flex items-stretch">
                  <span class="phone-prefix">+998</span>
                  <input id="reg-phone" v-model="leadForm.phone" type="tel" placeholder="90 123 45 67" required maxlength="12" @input="formatPhoneInput" class="form-input rounded-l-none border-l-0" />
                </div>
              </div>

              <!-- Birth Date (Custom Calendar Picker) -->
              <div>
                <label class="form-label">Tug'ilgan sana <span class="text-red-400">*</span></label>
                <div class="relative" ref="datePickerRef">
                  <!-- Trigger Button -->
                  <button
                    type="button"
                    @click="showCalendar = !showCalendar"
                    class="form-input w-full text-left flex items-center justify-between cursor-pointer"
                    :class="{ 'text-slate-400': !leadForm.birthDate }"
                  >
                    <span>{{ birthDateDisplay || "Kun / Oy / Yil tanlang" }}</span>
                    <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                  </button>

                  <!-- Calendar Dropdown -->
                  <Transition name="dropdown">
                    <div v-if="showCalendar" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
                      
                      <!-- Calendar Header: Nav -->
                      <div class="flex items-center justify-between px-4 py-3 bg-brand-primary">
                        <button type="button" @click="calPrevMonth" class="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                        </button>
                        <div class="flex items-center gap-2">
                          <!-- Month Selector -->
                          <select v-model="calMonth" class="bg-white/10 text-white text-sm font-bold rounded-lg px-2 py-1 border-0 outline-none cursor-pointer appearance-none text-center hover:bg-white/20 transition-colors">
                            <option v-for="(m, i) in monthNames" :key="i" :value="i" class="text-brand-primary bg-white">{{ m }}</option>
                          </select>
                          <!-- Year Selector -->
                          <select v-model="calYear" class="bg-white/10 text-white text-sm font-bold rounded-lg px-2 py-1 border-0 outline-none cursor-pointer appearance-none text-center hover:bg-white/20 transition-colors">
                            <option v-for="y in yearOptions" :key="y" :value="y" class="text-brand-primary bg-white">{{ y }}</option>
                          </select>
                        </div>
                        <button type="button" @click="calNextMonth" class="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                        </button>
                      </div>

                      <!-- Weekday Names -->
                      <div class="grid grid-cols-7 px-3 pt-3 pb-1">
                        <div v-for="wd in weekDays" :key="wd" class="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{{ wd }}</div>
                      </div>

                      <!-- Day Grid -->
                      <div class="grid grid-cols-7 gap-0.5 px-3 pb-3">
                        <!-- Empty cells for offset -->
                        <div v-for="n in firstDayOffset" :key="'e'+n"></div>
                        <!-- Day buttons -->
                        <button
                          v-for="day in daysInMonth"
                          :key="day"
                          type="button"
                          @click="selectDate(day)"
                          class="w-full aspect-square rounded-lg text-sm font-semibold flex items-center justify-center transition-all duration-150"
                          :class="getDayClass(day)"
                        >
                          {{ day }}
                        </button>
                      </div>

                      <!-- Quick Actions -->
                      <div class="border-t border-slate-100 px-3 py-2.5 flex items-center justify-between">
                        <button type="button" @click="clearDate" class="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-2 py-1">
                          Tozalash
                        </button>
                        <button type="button" @click="showCalendar = false" class="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors px-3 py-1 rounded-lg hover:bg-brand-primary/5">
                          Yopish
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
                <p class="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  Tug'ilgan sanangiz parol sifatida ishlatiladi
                </p>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-100"></div>

          <!-- ═══════════ SECTION 2: Ota-ona ma'lumotlari ═══════════ -->
          <div class="px-6 sm:px-8 py-6">
            <h2 class="section-title">
              <span class="section-badge">2</span>
              Ota-ona ma'lumotlari
            </h2>
            <div>
              <label for="reg-parent-phone" class="form-label">Ota-ona telefon raqami <span class="text-red-400">*</span></label>
              <div class="flex items-stretch">
                <span class="phone-prefix">+998</span>
                <input id="reg-parent-phone" v-model="leadForm.parentPhone" type="tel" placeholder="90 123 45 67" required maxlength="12" @input="formatParentPhoneInput" class="form-input rounded-l-none border-l-0" />
              </div>
              <p class="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
                <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                Farzandingiz natijalarini ko'rish uchun
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-100"></div>

          <!-- ═══════════ SECTION 3: Kurs tafsilotlari ═══════════ -->
          <div class="px-6 sm:px-8 py-6">
            <h2 class="section-title">
              <span class="section-badge">3</span>
              Kurs tafsilotlari
            </h2>
            <div class="space-y-5">
              <!-- Course -->
              <div>
                <label for="reg-course" class="form-label">Kursni tanlang <span class="text-red-400">*</span></label>
                <div class="relative">
                  <select id="reg-course" v-model="leadForm.course" required class="form-input appearance-none pr-10 cursor-pointer">
                    <option value="" disabled>{{ coursesLoading ? "Kurslar yuklanmoqda..." : "Kursni tanlang" }}</option>
                    <option v-for="course in courses" :key="course._id" :value="course.title">{{ course.title }} — {{ course.duration }}</option>
                    <option v-if="!coursesLoading && courses.length === 0" value="" disabled>Kurslar mavjud emas</option>
                  </select>
                  <svg class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>

              <!-- Source -->
              <div>
                <label for="reg-source" class="form-label">Bizni qayerdan topdingiz?</label>
                <div class="relative">
                  <select id="reg-source" v-model="leadForm.source" class="form-input appearance-none pr-10 cursor-pointer">
                    <option value="WEBSITE">Veb-sayt</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="REFERRAL">Do'st orqali</option>
                  </select>
                  <svg class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-100"></div>

          <!-- ═══════════ FOOTER: Submit + Info ═══════════ -->
          <div class="px-6 sm:px-8 py-6 space-y-4">
            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="submitting || !isFormValid"
              class="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/25 hover:bg-[#0A3A5C] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-brand-primary"
            >
              <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <svg v-else class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
              {{ submitting ? "Yuborilmoqda..." : "Arizani Yuborish" }}
            </button>

            <!-- Login Info Alert -->
            <div class="bg-brand-primary/[0.04] border border-brand-primary/10 rounded-xl px-4 py-3.5 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-primary leading-relaxed">
                  <span class="text-slate-500 font-medium">Login:</span> +998{{ leadForm.phone || '90*******' }}
                  <span class="mx-1.5 text-slate-300">•</span>
                  <span class="text-slate-500 font-medium">Parol:</span> Tug'ilgan sanangiz
                </p>
                <p class="text-[11px] text-slate-400 mt-0.5">Ro'yxatdan o'tganingizdan so'ng shu ma'lumotlar bilan tizimga kirasiz</p>
              </div>
            </div>

            <!-- Link -->
            <p class="text-center text-xs text-slate-400 pt-1">
              Hisobingiz bormi?
              <NuxtLink to="/login" class="text-brand-primary font-bold hover:text-brand-accent transition-colors ml-1">Tizimga kirish</NuxtLink>
            </p>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-[11px] text-slate-400 mt-6 animate-fade-in-up" style="animation-delay: 160ms;">
        © {{ new Date().getFullYear() }} ORZU EDU. Barcha ma'lumotlaringiz xavfsiz saqlanadi.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

useHead({
  title: "Kursga Yozilish — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quv markazi kurslariga oson va tez ro'yxatdan o'tish." }
  ]
});

const route = useRoute();

// ═══════════════════════════════════════════
// Form State (MUST be declared first — used by calendar, validation, etc.)
// ═══════════════════════════════════════════
const leadForm = reactive({
  fullname: "",
  phone: "",
  parentPhone: "",
  birthDate: "",     // YYYY-MM-DD
  course: "",
  source: "WEBSITE"
});

const submitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref("");

// ═══════════════════════════════════════════
// Courses from backend
// ═══════════════════════════════════════════
const { data: coursesData, pending: coursesLoading } = await useFetch<any>(
  "/api/v1/courses",
  { key: "register-courses-list" }
);
const courses = computed(() => coursesData.value?.data?.courses ?? []);

// ═══════════════════════════════════════════
// Calendar (Custom Date Picker) Logic
// ═══════════════════════════════════════════
const monthNames = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];
const weekDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

const currentYear = new Date().getFullYear();
const showCalendar = ref(false);
const datePickerRef = ref<HTMLElement | null>(null);

// Calendar state — start at a reasonable default (e.g., 2007)
const calYear = ref(currentYear - 19);
const calMonth = ref(0); // 0-indexed

// Generate year options (age 5–60)
const yearOptions = computed(() => {
  const years: number[] = [];
  for (let y = currentYear - 5; y >= currentYear - 60; y--) {
    years.push(y);
  }
  return years;
});

// Days in currently selected month
const daysInMonth = computed(() => new Date(calYear.value, calMonth.value + 1, 0).getDate());

// First day of month (0=Sun → adjust for Mon-first: (day+6)%7)
const firstDayOffset = computed(() => {
  const d = new Date(calYear.value, calMonth.value, 1).getDay();
  return (d + 6) % 7; // Monday = 0
});

const calPrevMonth = () => {
  if (calMonth.value === 0) {
    calMonth.value = 11;
    calYear.value--;
  } else {
    calMonth.value--;
  }
};

const calNextMonth = () => {
  if (calMonth.value === 11) {
    calMonth.value = 0;
    calYear.value++;
  } else {
    calMonth.value++;
  }
};

const selectDate = (day: number) => {
  const mm = String(calMonth.value + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  leadForm.birthDate = `${calYear.value}-${mm}-${dd}`;
  showCalendar.value = false;
};

const clearDate = () => {
  leadForm.birthDate = '';
};

// Computed display string
const birthDateDisplay = computed(() => {
  if (!leadForm.birthDate) return '';
  const [y, m, d] = leadForm.birthDate.split('-');
  const monthIdx = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${monthNames[monthIdx]} ${y}`;
});

// Highlight logic
const getDayClass = (day: number) => {
  const mm = String(calMonth.value + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const dateStr = `${calYear.value}-${mm}-${dd}`;
  if (leadForm.birthDate === dateStr) {
    return 'bg-brand-primary text-white shadow-md shadow-brand-primary/30 scale-105';
  }
  return 'text-slate-700 hover:bg-brand-primary/10 hover:text-brand-primary';
};

// Close calendar on outside click
const handleOutsideClick = (e: MouseEvent) => {
  if (datePickerRef.value && !datePickerRef.value.contains(e.target as Node)) {
    showCalendar.value = false;
  }
};

// When birthDate changes, sync calendar view
watch(() => leadForm.birthDate, (val) => {
  if (val) {
    const [y, m] = val.split('-');
    calYear.value = parseInt(y, 10);
    calMonth.value = parseInt(m, 10) - 1;
  }
});

onMounted(() => document.addEventListener('mousedown', handleOutsideClick));
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick));

// ═══════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════
const isFormValid = computed(() => (
  leadForm.fullname.trim().length >= 2 &&
  leadForm.phone.length === 9 &&
  leadForm.parentPhone.length === 9 &&
  leadForm.birthDate !== "" &&
  leadForm.course !== ""
));

// ═══════════════════════════════════════════
// Phone Formatting (shared)
// ═══════════════════════════════════════════
const formatPhone = (event: Event, target: 'phone' | 'parentPhone') => {
  const input = event.target as HTMLInputElement;
  let digits = input.value.replace(/\D/g, '').slice(0, 9);
  let formatted = digits;
  if (digits.length > 2) formatted = digits.slice(0, 2) + ' ' + digits.slice(2);
  if (digits.length > 5) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  if (digits.length > 7) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 7) + ' ' + digits.slice(7);
  leadForm[target] = digits;
  input.value = formatted;
};
const formatPhoneInput = (e: Event) => formatPhone(e, 'phone');
const formatParentPhoneInput = (e: Event) => formatPhone(e, 'parentPhone');

// ═══════════════════════════════════════════
// Preselect course from URL
// ═══════════════════════════════════════════
onMounted(() => {
  if (route.query.course) {
    leadForm.course = route.query.course as string;
  }
});

// ═══════════════════════════════════════════
// Submit
// ═══════════════════════════════════════════
const submitLead = async () => {
  if (!isFormValid.value) {
    submitError.value = "Iltimos, barcha majburiy maydonlarni to'ldiring";
    return;
  }

  submitting.value = true;
  submitError.value = "";

  const fullPhone = `+998${leadForm.phone}`;
  const parentPhoneFull = `+998${leadForm.parentPhone}`;
  const birthDateFormatted = leadForm.birthDate;

  try {
    const userData = {
      firstname: leadForm.fullname.split(' ')[0] || leadForm.fullname,
      lastname: leadForm.fullname.split(' ').slice(1).join(' ') || '',
      phone: fullPhone,
      email: `${leadForm.phone}@temp.uz`,
      password: birthDateFormatted,
      birthDate: birthDateFormatted,
      role: 'STUDENT',
      parentPhone: parentPhoneFull,
      course: leadForm.course,
      source: leadForm.source,
    };

    const userResponse = await $fetch("/api/v1/auth/register", {
      method: "POST",
      body: userData
    });

    submitSuccess.value = true;
  } catch (err: any) {
    if (err?.data?.message?.includes('telefon')) {
      submitError.value = "Bu telefon raqami allaqachon ro'yxatdan o'tgan.";
    } else {
      submitError.value = err?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* ═══════ Reusable Form Classes ═══════ */
.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569; /* slate-600 */
  margin-bottom: 0.375rem;
}

.form-input {
  width: 100%;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #102A43;
  transition: all 0.2s ease;
}
.form-input::placeholder { color: #94a3b8; }
.form-input:focus {
  outline: none;
  background-color: #fff;
  border-color: #082F49;
  box-shadow: 0 0 0 3px rgba(8, 47, 73, 0.08);
}

.phone-prefix {
  display: inline-flex;
  align-items: center;
  padding: 0 0.875rem;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-right: 0;
  border-radius: 0.75rem 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #082F49;
  user-select: none;
}

.section-title {
  font-size: 0.6875rem;
  font-weight: 800;
  color: #082F49;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-badge {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  background-color: rgba(8, 47, 73, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #082F49;
  font-size: 0.625rem;
  font-weight: 900;
}

/* ═══════ Select Arrow Fix ═══════ */
select option {
  background-color: #fff;
  color: #0f172a;
}

/* ═══════ Calendar Dropdown Transition ═══════ */
.dropdown-enter-active {
  animation: dropdown-in 0.2s ease-out;
}
.dropdown-leave-active {
  animation: dropdown-in 0.15s ease-in reverse;
}
@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══════ Page Animation ═══════ */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out both;
}
</style>