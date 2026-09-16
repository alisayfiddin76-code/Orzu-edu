<template>
  <div class="py-20 max-w-7xl mx-auto px-6 bg-brand-background min-h-screen">
    <!-- Header -->
    <div class="text-center mb-16 animate-slide-up">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-accent/20 border border-brand-accent text-brand-primary mb-6 shadow-sm">
        🏆 Natijalarimiz va Zafarlarimiz
      </span>
      <h1 class="text-4xl sm:text-5xl font-black text-brand-primary tracking-tight">
        Muvaffaqiyatli <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">O'quvchilarimiz</span>
      </h1>
      <p class="text-slate-600 mt-6 max-w-2xl mx-auto text-base font-medium leading-relaxed">
        Bitiruvchilarimiz tomonidan qo'lga kiritilgan xalqaro sertifikatlar, IELTS natijalari hamda IT sohasidagi yutuqlar.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20 text-brand-danger font-bold">
      <p>Natijalarni yuklashda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="achievements.length === 0" class="text-center py-20 text-slate-500 font-medium">
      <p>Hozircha natijalar qo'shilmagan.</p>
    </div>

    <!-- Achievements Grid (Blog Style) -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink 
          v-for="(ach, index) in paginatedAchievements" 
          :key="ach._id"
          :to="`/results/${ach._id}`"
          class="bg-white border border-brand-border hover:border-brand-accent/50 transition-all duration-300 rounded-3xl flex flex-col justify-between group shadow-xl shadow-brand-primary/5 hover:shadow-2xl relative overflow-hidden focus:outline-none animate-slide-up"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div>
            <!-- Image -->
            <div class="relative h-56 w-full bg-slate-100 overflow-hidden">
              <img 
                v-if="ach.certificateImage" 
                :src="`${ach.certificateImage}`" 
                :alt="ach.studentName" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-medium">
                🖼 Rasm mavjud emas
              </div>
              
              <!-- Year badge -->
              <span class="absolute bottom-4 right-4 text-xs font-bold bg-white/90 text-brand-primary py-1.5 px-3 rounded-lg backdrop-blur-md shadow-sm border border-brand-border/50">
                📅 {{ ach.year }} yil
              </span>
            </div>

            <!-- Content Padding -->
            <div class="p-6 sm:p-8">
              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider bg-brand-accent/10 text-brand-primary">
                  {{ ach.course }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-black text-brand-primary mb-4 group-hover:text-[#1A4B65] transition-colors duration-300 leading-snug">
                {{ ach.studentName }}
              </h3>

              <!-- Excerpt (Truncated) -->
              <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium mb-2">
                {{ ach.description || "O'quvchimizning ajoyib natijalaridan biri." }}
              </p>
            </div>
          </div>

          <!-- Footer Info -->
          <div class="px-6 sm:px-8 pb-6 pt-5 border-t border-brand-border/60 mt-auto flex items-center justify-between text-xs font-bold text-slate-500">
            <span class="flex items-center gap-2">
              Batafsil o'qish ➔
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
        <button 
          @click="currentPage > 1 && currentPage--" 
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-xl border border-brand-border bg-white text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-bold transition-colors"
        >
          Oldingi
        </button>
        
        <div class="flex items-center gap-1">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            :class="[
              'w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center',
              currentPage === page 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                : 'border border-brand-border bg-white text-slate-600 hover:bg-slate-50'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="currentPage < totalPages && currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-xl border border-brand-border bg-white text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-bold transition-colors"
        >
          Keyingi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

useHead({
  title: "Natijalarimiz — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU bitiruvchilarining erishgan natijalari, sertifikatlari va yutuqlari." }
  ]
});

const { data: achData, pending, error } = await useFetch<any>("/api/v1/achievements", {
  key: "public-achievements"
});

const achievements = computed(() => achData.value?.data?.achievements ?? []);

// Pagination Logic
const currentPage = ref(1);
const itemsPerPage = 6;

const totalPages = computed(() => Math.ceil(achievements.value.length / itemsPerPage));

const paginatedAchievements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return achievements.value.slice(start, start + itemsPerPage);
});
</script>
