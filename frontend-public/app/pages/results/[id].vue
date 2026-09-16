<template>
  <div class="py-20 max-w-4xl mx-auto px-6 bg-brand-background min-h-screen">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !achievement" class="text-center py-20 text-brand-danger font-bold">
      <p>Ma'lumotni yuklashda xatolik yuz berdi yoki topilmadi.</p>
      <NuxtLink to="/results" class="inline-block mt-4 text-brand-accent hover:underline">
        Natijalarga qaytish
      </NuxtLink>
    </div>

    <!-- Content -->
    <div v-else class="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-2xl animate-slide-up">
      <!-- Back Button -->
      <NuxtLink to="/results" class="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold transition-colors mb-8 text-sm">
        <span class="text-lg">←</span> Barcha natijalar
      </NuxtLink>

      <div class="flex flex-col md:flex-row gap-10 items-start">
        <!-- Image Section -->
        <div class="w-full md:w-1/2 flex-shrink-0">
          <div 
            class="relative w-full rounded-2xl overflow-hidden shadow-lg border border-brand-border bg-slate-50 cursor-zoom-in"
            @click="openModal(`${achievement.certificateImage}`)"
          >
            <img 
              v-if="achievement.certificateImage" 
              :src="`${achievement.certificateImage}`" 
              :alt="achievement.studentName" 
              class="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-64 flex items-center justify-center text-slate-400 font-medium">
              🖼 Rasm mavjud emas
            </div>
            <div class="absolute inset-0 bg-brand-primary/10 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
              <span class="bg-white text-brand-primary px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                Kattalashtirish 🔍
              </span>
            </div>
          </div>
        </div>

        <!-- Details Section -->
        <div class="w-full md:w-1/2">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-4 py-1.5 rounded-lg text-xs uppercase font-black tracking-wider bg-brand-accent/10 text-brand-primary">
              {{ achievement.course }}
            </span>
            <span class="px-4 py-1.5 rounded-lg text-xs font-black bg-brand-primary/5 text-slate-600 border border-brand-border">
              📅 {{ achievement.year }} yil
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-brand-primary mb-6 leading-tight">
            {{ achievement.studentName }}
          </h1>

          <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
            <p v-if="achievement.description" class="whitespace-pre-line">{{ achievement.description }}</p>
            <p v-else class="italic text-slate-400">Ushbu natija bo'yicha batafsil ma'lumot kiritilmagan.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div 
      v-if="isModalOpen" 
      @click="closeModal"
      class="fixed inset-0 z-[100] bg-brand-primary/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
    >
      <div class="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center animate-slide-up">
        <img 
          :src="modalImage" 
          class="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl ring-1 ring-white/20" 
          @click.stop
        />
        <button 
          @click="closeModal"
          class="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all duration-300"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const route = useRoute();
const id = route.params.id;

const { data: achData, pending, error } = await useFetch<any>(`/api/v1/achievements/${id}`, {
  key: `public-achievement-${id}`
});

const achievement = computed(() => achData.value?.data?.achievement || null);

useHead({
  title: computed(() => achievement.value ? `${achievement.value.studentName} — Natijalar` : 'Natija — ORZU EDU'),
  meta: [
    { name: "description", content: computed(() => achievement.value?.description || "ORZU EDU o'quvchisi natijasi") }
  ]
});

// Modal management
const isModalOpen = ref(false);
const modalImage = ref('');

const openModal = (url: string) => {
  modalImage.value = url;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  modalImage.value = '';
};
</script>
