<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">✉ Mijoz Xabarlari</h1>
        <p class="text-sm text-slate-400 mt-1">Saytdan yuborilgan aloqa xabarlari va murojaatlarni ko'rib chiqish</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Unread Badge -->
        <span 
          v-if="unreadCount > 0"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        >
          {{ unreadCount }} ta o'qilmagan xabar
        </span>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
      ✅ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      ❌ {{ errorMessage }}
    </div>

    <!-- Table / List -->
    <div v-if="loading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Xabarlar yuklanmoqda...</p>
    </div>

    <div v-else-if="messages.length === 0" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-slate-400">
      Kelgan xabarlar mavjud emas.
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div 
        v-for="msg in messages" 
        :key="msg._id"
        class="border rounded-2xl p-6 transition-all duration-300 relative shadow-md"
        :class="msg.read 
          ? 'bg-slate-900/20 border-slate-800/80 text-slate-300' 
          : 'bg-indigo-950/15 border-indigo-500/20 text-white'"
      >
        <!-- Unread Dot Indicator -->
        <span 
          v-if="!msg.read"
          class="absolute top-6 left-4 w-2.5 h-2.5 bg-indigo-500 rounded-full"
        ></span>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pl-4">
          <div>
            <span class="text-xs text-slate-500">{{ new Date(msg.createdAt).toLocaleString('uz-UZ') }}</span>
            <h3 class="text-lg font-bold mt-1">Mavzu: {{ msg.subject || 'Umumiy savol' }}</h3>
          </div>
          <div class="flex gap-2">
            <button
              v-if="!msg.read"
              class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-semibold transition-colors"
              @click="markAsRead(msg._id)"
            >
              ✓ O'qilgan deb belgilash
            </button>
            <button
              class="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-lg font-semibold transition-colors"
              @click="deleteMessage(msg._id)"
            >
              O'chirish
            </button>
          </div>
        </div>

        <!-- Sender info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl mb-4 pl-4">
          <div>
            <span class="text-xs text-slate-500 block">Yuboruvchi:</span>
            <span class="font-bold">{{ msg.name }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Telefon:</span>
            <span class="font-bold">{{ msg.phone }}</span>
            <span v-if="msg.email" class="text-xs text-slate-400 block mt-0.5">Email: {{ msg.email }}</span>
          </div>
        </div>

        <!-- Message Body -->
        <div class="text-sm bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line leading-relaxed pl-4">
          {{ msg.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin'
});

const messages = ref<any[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const fetchMessages = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    const response: any = await $fetch("/api/v1/messages", {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    messages.value = response.data.messages || [];
    unreadCount.value = response.unreadCount || 0;
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Xabarlarni yuklashda xatolik yuz berdi';
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (id: string) => {
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    await $fetch(`/api/v1/messages/${id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    successMessage.value = 'Xabar o\'qilgan deb belgilandi!';
    await fetchMessages();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Xabarni o\'qilgan qilishda xatolik yuz berdi';
  }
};

const deleteMessage = async (id: string) => {
  if (!confirm("Haqiqatdan ham bu xabarni o'chirmoqchisiz?")) return;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    await $fetch(`/api/v1/messages/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    successMessage.value = 'Xabar muvaffaqiyatli o\'chirildi!';
    await fetchMessages();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'O\'chirishda xatolik yuz berdi';
  }
};

onMounted(() => {
  fetchMessages();
});
</script>
