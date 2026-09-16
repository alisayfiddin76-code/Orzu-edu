<template>
  <div class="py-6 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 min-h-screen">
    <!-- Welcome Header: Premium Brand Design -->
    <div class="bg-brand-primary rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border-b-4 border-brand-accent">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-2xl"></div>
      
      <div class="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
        <!-- Avatar Initial with Dynamic soft border/shadow -->
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center text-brand-primary font-black text-2xl sm:text-3xl shadow-lg border-2 border-brand-accent/50">
          {{ user?.firstname ? user.firstname[0] : 'U' }}
        </div>
        
        <div class="flex-1 space-y-1.5">
          <span class="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
            O'quvchi Kabineti
          </span>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ user?.firstname }} {{ user?.lastname }}
          </h1>
          <p class="text-[#94B0C7] text-xs sm:text-sm flex flex-wrap justify-center sm:justify-start items-center gap-2 font-medium">
            <span>📞 {{ user?.phone }}</span>
            <span v-if="user?.birthdate" class="text-brand-primary/50">•</span>
            <span v-if="user?.birthdate">📅 {{ user.birthdate }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="space-y-4">
      <h2 class="text-xl font-black text-brand-primary tracking-tight flex items-center gap-2 px-1">
        <span>📂</span> Mening ma'lumotlarim
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        <!-- Davomatim -->
        <NuxtLink to="/dashboard/attendance"
          class="flex flex-col justify-between p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-accent hover:-translate-y-1 transition-all duration-300 group shadow-lg shadow-brand-primary/5 min-h-[130px]">
          <div class="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-xl group-hover:bg-brand-primary/5 transition-colors">
            📋
          </div>
          <div class="mt-4">
            <p class="text-sm font-black text-brand-primary group-hover:text-[#1A4B65] transition-colors">Davomatim</p>
            <p class="text-[10px] text-brand-textSecondary mt-1 leading-tight font-medium">Darslardagi ishtirok tarixi</p>
          </div>
        </NuxtLink>

        <!-- Baholarim -->
        <NuxtLink to="/dashboard/grades"
          class="flex flex-col justify-between p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-accent hover:-translate-y-1 transition-all duration-300 group shadow-lg shadow-brand-primary/5 min-h-[130px]">
          <div class="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-xl group-hover:bg-brand-primary/5 transition-colors">
            ⭐
          </div>
          <div class="mt-4">
            <p class="text-sm font-black text-brand-primary group-hover:text-[#1A4B65] transition-colors">Baholarim</p>
            <p class="text-[10px] text-brand-textSecondary mt-1 leading-tight font-medium">O'zlashtirish ko'rsatkichlari</p>
          </div>
        </NuxtLink>

        <!-- Vazifalarim -->
        <NuxtLink to="/dashboard/homework"
          class="flex flex-col justify-between p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-accent hover:-translate-y-1 transition-all duration-300 group shadow-lg shadow-brand-primary/5 min-h-[130px]">
          <div class="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-xl group-hover:bg-brand-primary/5 transition-colors">
            📝
          </div>
          <div class="mt-4">
            <p class="text-sm font-black text-brand-primary group-hover:text-[#1A4B65] transition-colors">Vazifalarim</p>
            <p class="text-[10px] text-brand-textSecondary mt-1 leading-tight font-medium">Uy vazifalari va muddatlar</p>
          </div>
        </NuxtLink>

        <!-- Imtihonlarim -->
        <NuxtLink to="/dashboard/exams"
          class="flex flex-col justify-between p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-accent hover:-translate-y-1 transition-all duration-300 group shadow-lg shadow-brand-primary/5 min-h-[130px]">
          <div class="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-xl group-hover:bg-brand-primary/5 transition-colors">
            🏆
          </div>
          <div class="mt-4">
            <p class="text-sm font-black text-brand-primary group-hover:text-[#1A4B65] transition-colors">Imtihonlarim</p>
            <p class="text-[10px] text-brand-textSecondary mt-1 leading-tight font-medium">Imtihon ballari va rejalari</p>
          </div>
        </NuxtLink>

        <!-- Materiallar -->
        <NuxtLink to="/dashboard/materials"
          class="flex flex-col justify-between p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-accent hover:-translate-y-1 transition-all duration-300 group shadow-lg shadow-brand-primary/5 min-h-[130px]">
          <div class="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-xl group-hover:bg-brand-primary/5 transition-colors">
            📚
          </div>
          <div class="mt-4">
            <p class="text-sm font-black text-brand-primary group-hover:text-[#1A4B65] transition-colors">Materiallar</p>
            <p class="text-[10px] text-brand-textSecondary mt-1 leading-tight font-medium">Yuklangan darslik materiallari</p>
          </div>
        </NuxtLink>

        <!-- To'lovlarim -->
        <NuxtLink to="/dashboard/invoices"
          class="flex flex-col justify-between p-5 rounded-2xl bg-brand-accent/5 border border-brand-accent/30 hover:border-brand-accent hover:-translate-y-1 hover:bg-brand-accent/10 transition-all duration-300 group shadow-lg shadow-brand-primary/5 min-h-[130px]">
          <div class="w-12 h-12 rounded-xl bg-white border border-brand-accent/30 flex items-center justify-center text-xl group-hover:bg-white transition-colors">
            💳
          </div>
          <div class="mt-4">
            <p class="text-sm font-black text-brand-primary transition-colors">To'lovlarim</p>
            <p class="text-[10px] text-brand-textSecondary mt-1 leading-tight font-medium">Oylik to'lov tarixi va qarzlar</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Active Groups Section -->
    <div class="space-y-5 pt-4">
      <h2 class="text-xl font-black text-brand-primary tracking-tight flex items-center gap-2 px-1">
        <span>🏫</span> Mening guruhlarim
      </h2>

      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center items-center py-16 bg-white border border-brand-border rounded-3xl shadow-sm">
        <div class="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-10 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-medium">
        Guruhlarni yuklashda xatolik yuz berdi.
      </div>

      <!-- Empty State -->
      <div v-else-if="groups.length === 0" class="text-center py-16 bg-white border border-brand-border rounded-3xl space-y-4 px-6 shadow-sm">
        <div class="w-20 h-20 mx-auto bg-brand-background rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
        <p class="text-lg font-black text-brand-primary">Siz hali guruhga qo'shilmagansiz.</p>
        <p class="text-sm text-brand-textSecondary max-w-sm mx-auto leading-relaxed">Tez orada operatorlarimiz sizni guruhga qo'shishadi yoki quyidagi tugma orqali kurslarni ko'rishingiz mumkin.</p>
        <div class="pt-4">
          <NuxtLink to="/courses" class="inline-block bg-brand-primary hover:bg-[#0C3E63] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Kurslarni ko'rish
          </NuxtLink>
        </div>
      </div>

      <!-- Groups List -->
      <div v-else class="space-y-5">
        <div 
          v-for="group in groups" 
          :key="group._id"
          class="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-lg shadow-brand-primary/5 relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-300"
        >
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-brand-border pb-4">
            <div>
              <span class="text-[10px] text-brand-accent font-black uppercase tracking-widest">{{ group.course?.title }}</span>
              <h3 class="text-xl font-black text-brand-primary mt-1">{{ group.title || 'Guruh' }}</h3>
            </div>
            <span class="inline-flex self-start sm:self-center px-3 py-1 rounded-full text-xs font-black bg-green-50 text-green-600 border border-green-200">
              Faol Guruh
            </span>
          </div>

          <!-- Group Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-6">
            <div class="space-y-3">
              <p class="flex items-center gap-2.5 text-brand-textPrimary" v-if="group.start_time && group.end_time">
                <span class="w-8 h-8 rounded-full bg-brand-background flex items-center justify-center text-brand-primary">🕒</span>
                <span class="font-bold">{{ group.start_time }} – {{ group.end_time }}</span>
              </p>
              <p class="flex items-center gap-2.5 text-brand-textPrimary" v-if="group.teacher">
                <span class="w-8 h-8 rounded-full bg-brand-background flex items-center justify-center text-brand-primary">👨‍🏫</span>
                <span class="font-bold">{{ group.teacher.firstname }} {{ group.teacher.lastname }}</span>
              </p>
            </div>
            <div class="space-y-3">
              <p class="flex items-center gap-2.5 text-brand-textPrimary" v-if="group.days">
                <span class="w-8 h-8 rounded-full bg-brand-background flex items-center justify-center text-brand-primary">📅</span>
                <span class="font-bold">{{ daysLabel(group.days) }}</span>
              </p>
              <p class="flex items-center gap-2.5 text-brand-textPrimary" v-if="group.room">
                <span class="w-8 h-8 rounded-full bg-brand-background flex items-center justify-center text-brand-primary">🚪</span>
                <span class="font-bold">Xona: {{ group.room }}</span>
              </p>
            </div>
          </div>

          <!-- Payment Status Card -->
          <div v-if="group.invoice" class="rounded-2xl border-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            :class="{
              'bg-green-50 border-green-200': group.invoice.status === 'PAID',
              'bg-red-50 border-red-200': group.invoice.status === 'UNPAID' && group.invoice.needs_attention,
              'bg-orange-50 border-orange-200': group.invoice.status === 'UNPAID' && !group.invoice.needs_attention && !group.invoice.is_overdue,
              'bg-gray-50 border-gray-200': group.invoice.status === 'UNPAID' && group.invoice.is_overdue,
              'bg-brand-background border-brand-border': group.invoice.status === 'NO_INVOICE' || group.invoice.status === 'CANCELLED',
            }"
          >
            <div class="flex items-center gap-3">
              <!-- Pulse indicator -->
              <div class="relative flex items-center justify-center w-6 h-6">
                <span v-if="group.invoice.status === 'PAID'" class="text-green-600 text-lg">✅</span>
                <span v-else-if="group.invoice.needs_attention" class="relative flex h-3.5 w-3.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                </span>
                <span v-else-if="group.invoice.is_overdue" class="text-gray-500 text-lg">⛔</span>
                <span v-else class="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
              </div>

              <div>
                <p class="text-sm font-black uppercase tracking-wide"
                  :class="{
                    'text-green-700': group.invoice.status === 'PAID',
                    'text-red-700': group.invoice.status === 'UNPAID' && group.invoice.needs_attention,
                    'text-orange-700': group.invoice.status === 'UNPAID' && !group.invoice.needs_attention && !group.invoice.is_overdue,
                    'text-gray-600': group.invoice.is_overdue || group.invoice.status === 'NO_INVOICE',
                  }"
                >
                  {{ invoiceStatusLabel(group.invoice) }}
                </p>
                <p v-if="group.invoice.status === 'PAID' && group.invoice.paid_at" class="text-xs font-semibold text-green-600/70 mt-0.5">
                  {{ formatDate(group.invoice.paid_at) }}
                </p>
                <p v-else-if="group.invoice.status === 'UNPAID' && group.invoice.days_until_due !== null" class="text-xs font-semibold text-slate-500 mt-0.5">
                  <span v-if="group.invoice.days_until_due > 0" class="text-orange-600/80">{{ group.invoice.days_until_due }} kun qoldi</span>
                  <span v-else class="text-red-600/80">{{ Math.abs(group.invoice.days_until_due) }} kun kechikdi</span>
                </p>
              </div>
            </div>

            <p class="text-lg sm:text-xl font-black text-right"
              :class="{
                'text-green-700': group.invoice.status === 'PAID',
                'text-red-700': group.invoice.status === 'UNPAID',
                'text-gray-500': group.invoice.status === 'NO_INVOICE',
              }"
            >
              {{ group.invoice.amount ? formatMoney(group.invoice.amount) : '' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Section -->
    <div class="space-y-4 pt-6 border-t border-brand-border">
      <h2 class="text-xl font-black text-brand-primary tracking-tight flex items-center gap-2 px-1">
        <span>⚙️</span> Sozlamalar
      </h2>
      <NuxtLink to="/dashboard/change-password"
        class="flex items-center gap-4 p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-primary/30 transition-all duration-300 group shadow-sm hover:shadow-md">
        <div class="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-xl group-hover:bg-brand-primary/5 transition-colors">
          🔐
        </div>
        <div>
          <p class="text-sm font-black text-brand-primary transition-colors">Parolni O'zgartirish</p>
          <p class="text-[10px] text-brand-textSecondary mt-1 font-medium">Xavfsizligingiz uchun parolingizni yangilang</p>
        </div>
        <span class="ml-auto text-brand-textSecondary group-hover:text-brand-primary transition-colors">→</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

definePageMeta({
  middleware: 'auth'
});

useHead({
  title: "Kabinet — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quvchisi shaxsiy kabinet sahifasi." }
  ]
});

const authStore = useAuthStore();
const user = computed(() => authStore.user);

// Fetch student's assigned groups
const { data: groupsData, pending, error } = await useFetch<any>('/api/v1/students/my-groups', {
  key: "my-groups-list",
  headers: computed(() => ({
    Authorization: `Bearer ${authStore.token}`
  }))
});

const groups = computed(() => groupsData.value?.data?.groups ?? []);

// Convert ODD/EVEN/EVERYDAY/CUSTOM to human-readable Uzbek day names
const daysLabel = (days: string): string => {
  switch (days) {
    case 'ODD':      return 'Du, Chor, Juma'
    case 'EVEN':     return 'Se, Pay, Shan'
    case 'EVERYDAY': return 'Har kuni (Du–Shan)'
    case 'CUSTOM':   return 'Maxsus jadval'
    default:         return days || '—'
  }
}

// Invoice status uchun matn
const invoiceStatusLabel = (invoice: any): string => {
  if (invoice.status === 'PAID') return "Bu oy to'lovi: To'langan"
  if (invoice.status === 'CANCELLED') return "Bekor qilingan"
  if (invoice.status === 'UNPAID') {
    if (invoice.is_overdue) return "Bu oy to'lovi: Muddati o'tgan!"
    if (invoice.needs_attention) return "Bu oy to'lovi: Tezda to'lang!"
    return "Bu oy to'lovi: To'lanmagan"
  }
  // NO_INVOICE or others
  return "Bu oy to'lovi: To'lanmagan"
}

// Pul formatlash
const formatMoney = (val: number): string => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0) + ' so\'m'
}

// Sana formatlash: YYYY.MM.DD
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
</script>
