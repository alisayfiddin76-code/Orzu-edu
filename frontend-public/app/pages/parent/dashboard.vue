<template>
  <div class="py-6 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8 min-h-screen">
    <!-- Parent Welcome Header -->
    <div class="bg-brand-primary rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border-b-4 border-brand-accent animate-slide-up">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-2xl"></div>
      
      <div class="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
        <!-- Avatar -->
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center text-brand-primary font-black text-2xl sm:text-3xl shadow-lg border-2 border-brand-accent/50">
          {{ user?.firstname ? user.firstname[0] : 'O' }}
        </div>
        
        <div class="flex-1 space-y-1.5">
          <span class="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
            👨‍👩‍👧‍👦 Ota-ona Paneli
          </span>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ user?.firstname }} {{ user?.lastname }}
          </h1>
          <p class="text-[#94B0C7] text-xs sm:text-sm flex flex-wrap justify-center sm:justify-start items-center gap-2 font-medium">
            <span>📞 {{ user?.phone }}</span>
            <span class="text-white/30">•</span>
            <span>👶 {{ children.length }} ta farzand</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      <p class="text-brand-textSecondary font-semibold text-sm">Ma'lumotlar yuklanmoqda...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white border border-brand-danger/20 rounded-2xl p-8 text-center shadow-lg">
      <div class="w-16 h-16 bg-brand-danger/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
      <h3 class="text-lg font-black text-brand-primary mb-2">Xatolik yuz berdi</h3>
      <p class="text-brand-textSecondary text-sm font-medium">{{ error }}</p>
      <button @click="fetchDashboard" class="mt-6 px-6 py-3 bg-brand-primary text-white font-bold text-sm rounded-xl hover:bg-[#0C3E63] transition-colors">
        Qayta yuklash
      </button>
    </div>

    <!-- No Children Found -->
    <div v-else-if="children.length === 0" class="bg-white border border-brand-border rounded-2xl p-10 text-center shadow-lg">
      <div class="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">📭</div>
      <h3 class="text-xl font-black text-brand-primary mb-2">Farzandlar topilmadi</h3>
      <p class="text-brand-textSecondary text-sm font-medium max-w-md mx-auto">
        Sizning telefon raqamingizga bog'langan o'quvchilar hali yo'q. O'quvchi ro'yxatdan o'tayotganda ota-ona telefon raqami sifatida sizning raqamingiz kiritilishi kerak.
      </p>
    </div>

    <!-- Children Tabs -->
    <div v-else class="space-y-6">
      <!-- Child Selector (Tabs if multiple) -->
      <div v-if="children.length > 1" class="flex flex-wrap gap-3">
        <button
          v-for="(child, idx) in children"
          :key="idx"
          @click="activeChild = idx"
          class="px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 border-2 shadow-sm"
          :class="activeChild === idx 
            ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
            : 'bg-white text-brand-primary border-brand-border hover:border-brand-accent hover:-translate-y-0.5'"
        >
          {{ child.student?.user?.firstname }} {{ child.student?.user?.lastname }}
        </button>
      </div>

      <!-- Active Child Card -->
      <div v-if="currentChild" class="space-y-6">
        <!-- Child Info Header -->
        <div class="bg-white border border-brand-border rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xl border border-brand-primary/20">
            {{ currentChild.student?.user?.firstname?.[0] || 'F' }}
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-lg font-black text-brand-primary">
              {{ currentChild.student?.user?.firstname }} {{ currentChild.student?.user?.lastname }}
            </h2>
            <p class="text-xs text-brand-textSecondary font-medium mt-1">
              📞 {{ currentChild.student?.user?.phone }}
              <span v-if="currentChild.student?.status" class="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                :class="currentChild.student.status === 'ACTIVE' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'"
              >
                {{ currentChild.student.status === 'ACTIVE' ? 'Faol' : currentChild.student.status }}
              </span>
            </p>
          </div>
        </div>

        <!-- Section Tabs -->
        <div class="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-lg">
          <div class="flex border-b border-brand-border">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="flex-1 py-4 px-3 text-xs sm:text-sm font-bold text-center transition-all duration-300 relative"
              :class="activeTab === tab.id 
                ? 'text-brand-primary bg-brand-background' 
                : 'text-brand-textSecondary hover:text-brand-primary hover:bg-brand-background/50'"
            >
              <span class="text-base sm:text-lg mr-1.5">{{ tab.icon }}</span>
              {{ tab.label }}
              <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-accent rounded-t-full"></div>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="p-5 sm:p-6">
            <!-- GRADES TAB -->
            <div v-if="activeTab === 'grades'">
              <div v-if="currentChild.grades?.length === 0" class="text-center py-10">
                <div class="text-4xl mb-3">📝</div>
                <p class="text-brand-textSecondary font-medium text-sm">Hali baholar yo'q</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="grade in currentChild.grades"
                  :key="grade._id"
                  class="flex items-center justify-between p-4 rounded-xl bg-brand-background border border-brand-border hover:border-brand-accent/50 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg border-2"
                      :class="getGradeStyle(grade.value)"
                    >
                      {{ grade.value }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-brand-primary">{{ grade.topic || grade.group?.title || 'Baho' }}</p>
                      <p class="text-[10px] text-brand-textSecondary font-medium mt-0.5">
                        {{ formatDate(grade.date) }}
                        <span class="ml-1 font-semibold text-brand-primary">({{ grade.group?.title || 'Guruh' }})</span>
                      </p>
                    </div>
                  </div>
                  <div class="text-xs font-bold px-2 py-1 rounded-lg"
                    :class="getGradeBadge(grade.value)"
                  >
                    {{ getGradeLabel(grade.value) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- ATTENDANCE TAB -->
            <div v-if="activeTab === 'attendance'">
              <div v-if="currentChild.attendance?.length === 0" class="text-center py-10">
                <div class="text-4xl mb-3">📋</div>
                <p class="text-brand-textSecondary font-medium text-sm">Hali davomat yozuvlari yo'q</p>
              </div>
              <div v-else class="space-y-3">
                <!-- Attendance Summary -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="bg-brand-success/10 border border-brand-success/20 rounded-xl p-3 text-center">
                    <p class="text-2xl font-black text-brand-success">{{ attendanceSummary.present }}</p>
                    <p class="text-[10px] font-bold text-brand-success uppercase tracking-wider mt-1">Kelgan</p>
                  </div>
                  <div class="bg-brand-danger/10 border border-brand-danger/20 rounded-xl p-3 text-center">
                    <p class="text-2xl font-black text-brand-danger">{{ attendanceSummary.absent }}</p>
                    <p class="text-[10px] font-bold text-brand-danger uppercase tracking-wider mt-1">Kelmagan</p>
                  </div>
                  <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                    <p class="text-2xl font-black text-yellow-600">{{ attendanceSummary.late }}</p>
                    <p class="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mt-1">Kechikkan</p>
                  </div>
                </div>

                <!-- Attendance Records -->
                <div
                  v-for="record in currentChild.attendance"
                  :key="record._id"
                  class="flex items-center justify-between p-4 rounded-xl bg-brand-background border border-brand-border hover:border-brand-accent/50 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      :class="getAttendanceIcon(record.status)"
                    >
                      {{ record.status === 'PRESENT' ? '✅' : record.status === 'ABSENT' ? '❌' : '⏰' }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-brand-primary">{{ record.group?.title || 'Dars' }}</p>
                      <p class="text-[10px] text-brand-textSecondary font-medium mt-0.5">{{ formatDate(record.date) }}</p>
                    </div>
                  </div>
                  <span class="text-xs font-bold px-3 py-1.5 rounded-lg"
                    :class="getAttendanceBadge(record.status)"
                  >
                    {{ getAttendanceLabel(record.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- PAYMENTS TAB -->
            <div v-if="activeTab === 'payments'">
              <div v-if="!currentChild.invoices || currentChild.invoices.length === 0" class="text-center py-10">
                <div class="text-4xl mb-3">💳</div>
                <p class="text-brand-textSecondary font-medium text-sm">Hozircha to'lov ma'lumotlari yo'q</p>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="invoice in currentChild.invoices"
                  :key="invoice._id"
                  class="bg-brand-background border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 class="text-sm font-bold text-brand-primary mb-1">
                      {{ invoice.group?.title || 'Guruh' }} 
                      <span class="text-xs font-medium text-brand-textSecondary ml-2">({{ invoice.month }} oyi uchun)</span>
                    </h3>
                    <p class="text-xs text-brand-textSecondary font-medium">
                      To'lov muddati: <span class="font-bold text-brand-primary">{{ formatDateUz(invoice.due_date) }}</span>
                    </p>
                    <p v-if="invoice.status === 'PAID'" class="text-xs text-brand-textSecondary font-medium mt-0.5">
                      To'langan sana: <span class="font-bold text-brand-success">{{ formatDateUz(invoice.paid_at) }}</span>
                    </p>
                    <p v-if="invoice.status === 'PAID' && invoice.paid_at" class="text-xs text-brand-textSecondary font-medium mt-0.5">
                      Amal qilish muddati: <span class="font-bold text-brand-primary">{{ getValidUntil(invoice.paid_at) }} gacha</span>
                    </p>
                  </div>
                  <div class="flex flex-col sm:items-end gap-2">
                    <p class="text-lg font-black text-brand-primary">
                      {{ invoice.final_amount.toLocaleString('uz-UZ') }} so'm
                    </p>
                    <span
                      class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center"
                      :class="{
                        'bg-brand-success/10 text-brand-success': invoice.status === 'PAID',
                        'bg-brand-danger/10 text-brand-danger': invoice.status === 'UNPAID',
                        'bg-yellow-500/10 text-yellow-600': invoice.status !== 'PAID' && invoice.status !== 'UNPAID'
                      }"
                    >
                      {{ invoice.status === 'PAID' ? 'TO\'LANGAN' : invoice.status === 'UNPAID' ? 'TO\'LANMAGAN' : invoice.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TEACHERS & MESSAGES TAB -->
            <div v-if="activeTab === 'teachers'">
              <div v-if="!currentChild.teachers || currentChild.teachers.length === 0" class="text-center py-10">
                <div class="text-4xl mb-3">👨‍🏫</div>
                <p class="text-brand-textSecondary font-medium text-sm">Ushbu o'quvchiga biriktirilgan o'qituvchilar topilmadi</p>
              </div>
              <div v-else class="space-y-6">
                <div
                  v-for="teacher in currentChild.teachers"
                  :key="teacher._id"
                  class="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border bg-brand-background">
                    <div class="flex items-center gap-4">
                      <img v-if="teacher.avatar" :src="teacher.avatar" alt="Teacher" class="w-14 h-14 rounded-full object-cover border border-brand-border" />
                      <div v-else class="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xl border border-brand-primary/20">
                        {{ teacher.firstname?.[0] || 'T' }}
                      </div>
                      <div>
                        <h3 class="text-base font-bold text-brand-primary">{{ teacher.firstname }} {{ teacher.lastname }}</h3>
                        <p class="text-xs text-brand-textSecondary font-medium mt-0.5">Fan: {{ teacher.subject || 'O\'qituvchi' }}</p>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1.5 text-xs font-medium text-brand-textSecondary">
                      <a :href="`tel:${teacher.phone}`" class="flex items-center gap-2 hover:text-brand-primary transition-colors">
                        📞 {{ teacher.phone || 'Noma\'lum' }}
                      </a>
                      <a v-if="teacher.telegram" :href="`https://t.me/${teacher.telegram.replace('@', '')}`" target="_blank" class="flex items-center gap-2 hover:text-[#0088cc] transition-colors">
                        ✈️ Telegram: {{ teacher.telegram }}
                      </a>
                    </div>
                  </div>
                  
                  <!-- Chat Section -->
                  <div class="p-4 bg-white flex flex-col h-64">
                    <div class="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide">
                      <div v-if="!chatMessages[teacher._id] || chatMessages[teacher._id].length === 0" class="h-full flex items-center justify-center text-xs text-brand-textSecondary text-center">
                        O'qituvchiga xabar yozishingiz mumkin
                      </div>
                      <div v-else v-for="msg in chatMessages[teacher._id]" :key="msg._id" class="flex flex-col" :class="msg.sender === user?._id ? 'items-end' : 'items-start'">
                        <div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm"
                          :class="msg.sender === user?._id ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-brand-background text-brand-primary border border-brand-border rounded-tl-sm'"
                        >
                          {{ msg.message }}
                        </div>
                        <span class="text-[9px] text-brand-textSecondary mt-1 px-1">
                          {{ new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }}
                        </span>
                      </div>
                    </div>
                    
                    <form @submit.prevent="sendMessage(teacher._id)" class="flex items-center gap-2 mt-auto">
                      <input
                        v-model="newMessageText[teacher._id]"
                        type="text"
                        placeholder="Xabar yozing..."
                        class="flex-1 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary"
                        :disabled="sending[teacher._id]"
                      />
                      <button
                        type="submit"
                        class="bg-brand-primary text-white p-2.5 rounded-xl hover:bg-[#0C3E63] transition-colors disabled:opacity-50 flex items-center justify-center"
                        :disabled="!newMessageText[teacher._id]?.trim() || sending[teacher._id]"
                      >
                        <span v-if="!sending[teacher._id]">✈️</span>
                        <div v-else class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

definePageMeta({
  layout: 'default'
});

useHead({
  title: "Ota-ona Paneli — ORZU EDU",
  meta: [
    { name: "description", content: "Farzandlaringizning o'quv natijalari, davomati va to'lov holatini kuzating." }
  ]
});

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const loading = ref(true);
const error = ref('');
const children = ref<any[]>([]);
const activeChild = ref(0);
const activeTab = ref('grades');

const tabs = [
  { id: 'grades', label: 'Baholar', icon: '⭐' },
  { id: 'attendance', label: 'Davomat', icon: '📋' },
  { id: 'payments', label: "To'lovlar", icon: '💳' },
  { id: 'teachers', label: "O'qituvchilar va Xabarlar", icon: '👨‍🏫' }
];

const currentChild = computed(() => children.value[activeChild.value] || null);

// Attendance summary
const attendanceSummary = computed(() => {
  const records = currentChild.value?.attendance || [];
  return {
    present: records.filter((r: any) => r.status === 'PRESENT').length,
    absent: records.filter((r: any) => r.status === 'ABSENT').length,
    late: records.filter((r: any) => r.status === 'LATE').length,
  };
});

// Chat state
const chatMessages = ref<Record<string, any[]>>({});
const newMessageText = ref<Record<string, string>>({});
const sending = ref<Record<string, boolean>>({});
let chatPollInterval: any = null;

// Fetch messages for a teacher
const fetchMessages = async (teacherId: string) => {
  try {
    const token = authStore.token || (process.client ? localStorage.getItem('orzu_public_token') : null);
    if (!token) return;

    const res = await $fetch<any>(`/api/v1/chat/messages/${teacherId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 'success') {
      chatMessages.value[teacherId] = res.data.messages;
    }
  } catch (err) {
    console.error('Chat yuklashda xatolik:', err);
  }
};

// Send message
const sendMessage = async (teacherId: string) => {
  const text = newMessageText.value[teacherId]?.trim();
  if (!text) return;

  sending.value[teacherId] = true;
  try {
    const token = authStore.token || (process.client ? localStorage.getItem('orzu_public_token') : null);
    if (!token) return;

    const res = await $fetch<any>('/api/v1/chat/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { receiverId: teacherId, message: text }
    });

    if (res.status === 'success') {
      if (!chatMessages.value[teacherId]) chatMessages.value[teacherId] = [];
      chatMessages.value[teacherId].push(res.data.message);
      newMessageText.value[teacherId] = '';
    }
  } catch (err) {
    console.error('Xabar yuborishda xatolik:', err);
  } finally {
    sending.value[teacherId] = false;
  }
};

// Watch active tab to fetch messages
import { watch, onBeforeUnmount } from 'vue';

watch(activeTab, (newTab) => {
  if (newTab === 'teachers' && currentChild.value?.teachers?.length > 0) {
    // Initial fetch
    currentChild.value.teachers.forEach((t: any) => fetchMessages(t._id));
    
    // Start polling every 5 seconds
    if (!chatPollInterval) {
      chatPollInterval = setInterval(() => {
        if (activeTab.value === 'teachers' && currentChild.value?.teachers) {
          currentChild.value.teachers.forEach((t: any) => fetchMessages(t._id));
        }
      }, 5000);
    }
  } else {
    // Stop polling if we leave the tab
    if (chatPollInterval) {
      clearInterval(chatPollInterval);
      chatPollInterval = null;
    }
  }
});

onBeforeUnmount(() => {
  if (chatPollInterval) clearInterval(chatPollInterval);
});

// Fetch parent dashboard data
const fetchDashboard = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = authStore.token || (process.client ? localStorage.getItem('orzu_public_token') : null);
    if (!token) {
      navigateTo('/login');
      return;
    }

    const response = await $fetch<any>('/api/v1/parent/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 'success') {
      children.value = response.data.children || [];
    }
  } catch (err: any) {
    console.error('Parent dashboard error:', err);
    if (err?.status === 401 || err?.statusCode === 401) {
      authStore.logout();
      navigateTo('/login');
      return;
    }
    error.value = err?.data?.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    if (process.client) {
      authStore.initializeStore();
      if (!authStore.isAuthenticated) {
        navigateTo('/login');
        return;
      }
    }
  }
  fetchDashboard();
});

// ---- Helper Functions ----
const uzbekMonths = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
];

const formatDateUz = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = uzbekMonths[d.getMonth()];
  const year = d.getFullYear();
  return `${year}-yil ${day}-${month}`;
};

// Qaysi kuni to'lov qilsa, keyingi oyning shu kunigacha amal qiladi
const getValidUntil = (paidDateStr: string) => {
  if (!paidDateStr) return '';
  const paid = new Date(paidDateStr);
  if (isNaN(paid.getTime())) return '';
  // Keyingi oyning shu kunigacha
  const nextMonth = new Date(paid);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return formatDateUz(nextMonth.toISOString());
};

const formatDate = (dateStr: string) => {
  return formatDateUz(dateStr);
};

const getGradeStyle = (value: number) => {
  if (value >= 4) return 'bg-brand-success/10 text-brand-success border-brand-success/30';
  if (value >= 3) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
  return 'bg-brand-danger/10 text-brand-danger border-brand-danger/30';
};

const getGradeBadge = (value: number) => {
  if (value >= 4) return 'bg-brand-success/10 text-brand-success';
  if (value >= 3) return 'bg-yellow-500/10 text-yellow-600';
  return 'bg-brand-danger/10 text-brand-danger';
};

const getGradeLabel = (value: number) => {
  return `Baho: ${value}`;
};

const getAttendanceIcon = (status: string) => {
  if (status === 'PRESENT') return 'bg-brand-success/10';
  if (status === 'ABSENT') return 'bg-brand-danger/10';
  return 'bg-yellow-500/10';
};

const getAttendanceBadge = (status: string) => {
  if (status === 'PRESENT') return 'bg-brand-success/10 text-brand-success';
  if (status === 'ABSENT') return 'bg-brand-danger/10 text-brand-danger';
  return 'bg-yellow-500/10 text-yellow-600';
};

const getAttendanceLabel = (status: string) => {
  if (status === 'PRESENT') return 'Kelgan';
  if (status === 'ABSENT') return 'Kelmagan';
  if (status === 'LATE') return 'Kechikkan';
  return status;
};
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out;
}
</style>
